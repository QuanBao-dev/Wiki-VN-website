import "./ChatMessagesList.css";

import { ChatText } from "../../Interfaces/ChatText";
import { userStore } from "../../store/user";
import { parseDate } from "../../util/parseDate";
import { LazyLoadImage } from "react-lazy-load-image-component";

interface Props {
  chatTexts: ChatText[];
  chatMessagesListRef: React.MutableRefObject<HTMLUListElement>;
}

const ChatMessagesList = ({ chatTexts, chatMessagesListRef }: Props) => {
  return (
    <ul className="chat-messages-list" ref={chatMessagesListRef}>
      {chatTexts
        .map(({ text, createdAt, user }, key) => {
          if (key > 0) {
            if (
              new Date(createdAt).getTime() -
                new Date(chatTexts[key - 1].createdAt).getTime() <
              3600000 / 4
            ) {
              return {
                text,
                user: {
                  username: user.username,
                  role: user.role,
                  avatarImage: user.avatarImage,
                  boost: user.boost || 1,
                },
              };
            }
          }
          return {
            text,
            createdAt,
            user: {
              username: user.username,
              role: user.role,
              avatarImage: user.avatarImage,
              boost: user.boost || 1,
            },
          };
        })
        .map(({ text, createdAt, user }, key) => (
          <li key={key}>
            {createdAt && (
              <div className="time-zone-message">
                <span>{parseDate(createdAt)}</span>
              </div>
            )}
            <div
              className={`chat-text-item${
                user.username === userStore.currentState().username
                  ? " current-user"
                  : ""
              }`}
            >
              <div className="text-message-info-container">
                <span className="avatar-user">
                  <LazyLoadImage
                    effect="opacity"
                    src={user.avatarImage || "/avatar.webp"}
                    alt=""
                  />
                </span>
                <span
                  className="username"
                  style={{
                    color: user.role === "Admin" ? "yellow" : "",
                  }}
                >
                  {user.username}
                </span>
              </div>
              <div className="chat-text">{text}</div>
            </div>
          </li>
        ))}
    </ul>
  );
};

export default ChatMessagesList;
