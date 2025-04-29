import { usePage } from "@inertiajs/react";
import ReactMarkdown from "react-markdown";
import React from "react";
import UserAvatar from "./UserAvatar";
import {formatMessageDateLong} from "@/helpers";

const MessageItem = ({ message }) => {
    const curruntUser = usePage().props.auth.user;
    return (
        <div
            className={
                "chat " + 
                (message.sender_id === curruntUser.id
                    ? "chat-end"
                    : "chat-start"
                )
            }
        >
            <div className="chat-image">
                {<UserAvatar user={message.sender} />}
            </div>
            <div className="chat-header">
                {message.sender_id !== curruntUser.id
                    ? message.sender.name 
                    : ""
                }
                <time className="text-xs opacity-50 ml-2">
                    {formatMessageDateLong(message.created_at)}
                </time>
            </div>
            <div 
                className={"chat-bubble relative " + 
                    (message.sender_id === curruntUser.id 
                        ? "chat-bubble-info"
                        : ""
                    )
                }
            >
                <div className="chat-message">
                    <div className="chat-message-content">
                        <ReactMarkdown>{message.message}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessageItem;