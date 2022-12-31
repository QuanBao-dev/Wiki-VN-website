import "./Chat.css";

import { useEffect, useRef, useState } from "react";

import ChatMessagesList from "../../components/ChatMessagesList/ChatMessagesList";
import { ChatText } from "../../Interfaces/ChatText";
import { userStore } from "../../store/user";
import socket from "../../util/socket";
import {
  catchError,
  filter,
  fromEvent,
  iif,
  of,
  pluck,
  switchMap,
  tap,
  timer,
} from "rxjs";
import { ajax } from "rxjs/ajax";
import { updateCaches } from "../../util/updateCaches";
import { chatStore } from "../../store/Chat";
import cachesStore from "../../store/caches";

const Chat = () => {
  const [chatTexts, setChatTexts] = useState<ChatText[]>(
    cachesStore.currentState().caches["messages"] || []
  );
  const [isLoading, setIsLoading] = useState(
    chatStore.currentState().isLoading
  );
  const [isStopFetching, setIsStopFetching] = useState(
    chatStore.currentState().isStopFetching
  );
  const [page, setPage] = useState(chatStore.currentState().page);
  const chatTextsRef = useRef<ChatText[]>([]);
  const inputRef = useRef(document.createElement("input"));
  const chatContainerRef = useRef(document.createElement("div"));
  const chatMessagesListRef = useRef(document.createElement("ul"));
  const countNewMessages = useRef(0);

  const addNewMessage = (
    message: string,
    avatarImage: string,
    role: string,
    username: string,
    boost: number
  ) => {
    let check = false;
    if (
      chatMessagesListRef.current &&
      chatMessagesListRef.current.scrollHeight /
        chatMessagesListRef.current.scrollTop <=
        chatStore.currentState().ratio + 0.1
    ) {
      check = true;
    }
    countNewMessages.current += 1;
    const array = [
      ...chatTextsRef.current,
      {
        createdAt: new Date(Date.now()).toISOString(),
        text: message,
        user: {
          avatarImage: avatarImage,
          role: role,
          username: username,
          boost: boost,
        },
      },
    ];
    setChatTexts(array);
    updateCaches(array, "messages");
    if (check) {
      setTimeout(() => {
        if (chatMessagesListRef.current) {
          chatMessagesListRef.current.scroll({
            top: 10000000000000,
          });
          chatStore.updateState({
            ratio:
              chatMessagesListRef.current.scrollHeight /
              chatMessagesListRef.current.scrollTop,
          });
        }
      }, 10);
    }
  };

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    document.body.style.overflowY = "hidden";
    window.scroll({ top: 0 });
    setTimeout(() => {
      chatMessagesListRef.current.scroll({
        top: chatStore.currentState().scrollTop,
      });
    }, 10);

    chatContainerRef.current.style.height = `${
      window.innerHeight - chatContainerRef.current.getBoundingClientRect().y
    }px`;
    const subscription = fromEvent(window, "resize").subscribe(() => {
      chatContainerRef.current.style.height = `${
        window.innerHeight - chatContainerRef.current.getBoundingClientRect().y
      }px`;
    });
    socket.on(
      "send-message-other-users",
      (
        message: string,
        username: string,
        role: string,
        avatarImage: string,
        boost: number
      ) => {
        addNewMessage(message, avatarImage, role, username, boost);
      }
    );
    return () => {
      document.body.style.overflowY = "auto";
      subscription.unsubscribe();
      // socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const subscription = iif(
      () => isLoading === false,
      fromEvent(chatMessagesListRef.current, "scroll").pipe(
        tap(() => {
          chatStore.updateState({
            scrollTop: chatMessagesListRef.current.scrollTop,
            ratio:
              chatMessagesListRef.current.scrollHeight /
              chatMessagesListRef.current.scrollTop,
          });
        }),
        filter(
          () =>
            chatMessagesListRef.current &&
            chatMessagesListRef.current.scrollTop === 0 &&
            !isLoading &&
            !isStopFetching
        ),
        tap(() => {
          chatStore.updateState({
            page: page + 1,
            isLoading: true,
          });
          setPage(page + 1);
          setIsLoading(true);
        }),
        filter(() => false)
      ),
      timer(0).pipe(
        filter(() => !isStopFetching),
        switchMap(() =>
          ajax({
            url: "/api/chat?page=" + page,
          }).pipe(
            pluck("response", "message"),
            catchError((error) => of(error).pipe(pluck("response")))
          )
        )
      )
    ).subscribe((v) => {
      if (v && !v.error) {
        setChatTexts([...v, ...chatTexts]);
        updateCaches([...v, ...chatTexts], "messages");
        if (chatMessagesListRef.current.children[0]) {
          chatMessagesListRef.current.children[v.length - 1].scrollIntoView({
            block: "start",
            inline: "end",
          });
          chatStore.updateState({
            ratio:
              chatMessagesListRef.current.scrollHeight /
              chatMessagesListRef.current.scrollTop,
          });
        } else {
          setTimeout(() => {
            chatMessagesListRef.current.scroll({
              top: chatMessagesListRef.current.scrollHeight,
            });
            chatStore.updateState({
              ratio:
                chatMessagesListRef.current.scrollHeight /
                chatMessagesListRef.current.scrollTop,
            });
          }, 100);
        }
      } else {
        chatStore.updateState({ isStopFetching: true });
        setIsStopFetching(true);
      }
      chatStore.updateState({ isLoading: false });
      setIsLoading(false);
    });
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, page, isStopFetching, chatTexts.length]);
  useEffect(() => {
    const subscription = fromEvent(window, "keydown").subscribe((e: any) => {
      if (e.key === "Escape") {
        chatMessagesListRef.current.scroll({
          top: 10000000000000,
        });
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  chatTextsRef.current = chatTexts;
  return (
    <section className="chat-container" ref={chatContainerRef}>
      {/* <ul className="online-users-list"></ul> */}
      <div className="chat-app-container">
        <ChatMessagesList
          chatTexts={chatTexts}
          chatMessagesListRef={chatMessagesListRef}
        />
        <div
          className="form-send-message"
          onClick={() => inputRef.current.focus()}
        >
          <input
            type="text"
            ref={inputRef}
            placeholder="Send Message"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (inputRef.current.value.trim() === "") return;
                addNewMessage(
                  inputRef.current.value,
                  userStore.currentState().avatarImage,
                  userStore.currentState().role,
                  userStore.currentState().username,
                  userStore.currentState().boost
                );

                socket.emit(
                  "new-message",
                  inputRef.current.value,
                  userStore.currentState().username,
                  userStore.currentState().role,
                  userStore.currentState().avatarImage,
                  userStore.currentState().boost
                );
                inputRef.current.value = "";
              }
            }}
          />
          <button
            onClick={() => {
              if (inputRef.current.value.trim() === "") return;
              addNewMessage(
                inputRef.current.value,
                userStore.currentState().avatarImage,
                userStore.currentState().role,
                userStore.currentState().username,
                userStore.currentState().boost
              );

              socket.emit(
                "new-message",
                inputRef.current.value,
                userStore.currentState().username,
                userStore.currentState().role,
                userStore.currentState().avatarImage,
                userStore.currentState().boost
              );
              inputRef.current.value = "";
            }}
          >
            <i className="fa fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Chat;
