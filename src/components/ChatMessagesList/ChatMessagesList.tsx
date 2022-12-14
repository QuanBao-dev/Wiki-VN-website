import "./ChatMessagesList.css";

import { ChatText } from "../../Interfaces/ChatText";
import { userStore } from "../../store/user";

interface Props {
  chatTexts: ChatText[];
  chatMessagesListRef: React.MutableRefObject<HTMLUListElement>;
}
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const ChatMessagesList = ({ chatTexts, chatMessagesListRef }: Props) => {
  return (
    <ul className="chat-messages-list" ref={chatMessagesListRef}>
      {chatTexts
        .map(({ text, createdAt, user }, key) => {
          if (key > 0) {
            if (
              new Date(createdAt).getTime() -
                new Date(chatTexts[key - 1].createdAt).getTime() <
              3600000/4
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
                <span>
                  {new Date(createdAt).getDate()}{" "}
                  {months[new Date(createdAt).getMonth()]} ,{" "}
                  {new Date(createdAt).getFullYear()} -{" "}
                  {parseNumber(new Date(createdAt).getHours())}:
                  {parseNumber(new Date(createdAt).getMinutes())}:
                  {parseNumber(new Date(createdAt).getSeconds())}
                </span>
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
                  <img src={user.avatarImage || "/avatar.webp"} alt="" />
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

function parseNumber(number: number) {
  return number < 10 ? "0" + number : number;
}

export default ChatMessagesList;
