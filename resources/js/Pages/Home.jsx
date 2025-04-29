import ChatLayout from '@/Layouts/ChatLayout';
import CoversationHeader from '@/Components/App/CoversationHeader';
import MessageItem from '@/Components/App/MessageItem';
import MessageInput from '@/Components/App/MessageInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import { useEventBus } from '@/EventBus';
import axios from 'axios';

function Home({ selectedConversation = null, messages = null }) {
    const [localMessages, setLocalMessages] = useState([]);
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [scrollFromBottom, setScrollFromBottom] = useState(0);
    const messageCtrRef = useRef(null);
    const loadMoreInterect = useRef(null);
    const {on} = useEventBus();

    const messageCreated = (message) => {
        if (
            selectedConversation && 
            selectedConversation.is_group && 
            selectedConversation.id == message.group_id
        ) {
           setLocalMessages((prevMessages) => [...prevMessages, message]); 
        }

        if (
            selectedConversation && 
            selectedConversation.is_user && 
            (selectedConversation.id == message.sender_id || 
                selectedConversation.id == message.receiver_id)
        ) {
           setLocalMessages((prevMessages) => [...prevMessages, message]); 
        }
    };

    const loadMoreMessages = useCallback(() => {
        if (noMoreMessages) {
            return;
        }

        const firstMessage = localMessages[0];
        axios
        .get(route("message.loadOlder", firstMessage.id))
        .then(({data}) => {
            if (data.data.length === 0) {
                setNoMoreMessages(true);
            }
            const scrollHeight = messageCtrRef.current.scrollHeight;
            const scrollTop = messageCtrRef.current.scrollTop;
            const clientHeight = messageCtrRef.current.clientHeight;
            const tmpScrollFromBottom = scrollHeight - scrollTop - clientHeight;
            console.log("tmpScrollFromBottom", tmpScrollFromBottom);
            setScrollFromBottom(scrollHeight - scrollTop - clientHeight);
            
            setLocalMessages((prevMessage) => {
                return [...data.data.reverse(), ...prevMessage];
            });
        })
    }, [localMessages, noMoreMessages]);

    useEffect(() => {
        setTimeout(() => {
        if (messageCtrRef.current) {
            messageCtrRef.current.scrollTop = messageCtrRef.current.scrollHeight;
        }

        const offCreated = on('message.created', messageCreated);

        setScrollFromBottom(0);
        setNoMoreMessages(false);

        return () => {
            offCreated();
        };
        }, 10);
    }, [selectedConversation]);

    useEffect(() => {
        setLocalMessages(messages ? messages.data.reverse() : []);
    }, [messages]);

    useEffect(() => {
        if (messageCtrRef.current && scrollFromBottom !== null) {
            messageCtrRef.current.scrollTop = 
            messageCtrRef.current.scrollHeight - 
            messageCtrRef.current.offsetHeight - 
            scrollFromBottom;

            if (noMoreMessages) {
                return;
            }

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) loadMoreMessages();
                    });
                },
                {
                    rootMargin: "0px 0px 250px 0px",
                }
            );            
            if (loadMoreInterect.current) {
                setTimeout(() => {
                    observer.observe(loadMoreInterect.current);
                }, 200)
            }

            return () => {
                observer.disconnect();
            }
        }
    }, [localMessages]);

    return <>
        {!messages && (
            <div className="flex flex-col gap-8 justify-center items-center text-center h-full opacity-35">
                <div className="text-2xl md:text-4xl p-16 text-slate-800">
                    Please select conversation to see messages
                </div>
                <ChatBubbleLeftRightIcon className="w-32 h-32 inline-block" />
            </div>
        )}
        {messages && (
            <>
                <CoversationHeader 
                    selectedConversation={selectedConversation}
                />
                <div 
                    ref={messageCtrRef}
                    className="flex-1 overflow-y-auto p-5"
                >
                    {/* Message */}

                    {localMessages.length === 0 && (
                        <div className="flex justify-center items-center h-full">
                            <div className="text-lg text-slate-200">
                                No message found
                            </div>
                        </div>
                    )}

                    {localMessages.length > 0 && (
                        <div className="flex-1 flex flex-col">
                            <div ref={loadMoreInterect}></div>
                            {localMessages.map((message) => (
                                <MessageItem
                                    key={message.id}
                                    message={message}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <MessageInput conversation={selectedConversation} />
            </>
        )}
    </>;
}

Home.layout = (page) => {
    return (
        <AuthenticatedLayout user={page.props.auth.user}>
            <ChatLayout children={page}></ChatLayout>
        </AuthenticatedLayout>
    );
}

export default Home;