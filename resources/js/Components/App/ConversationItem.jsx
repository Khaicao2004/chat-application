import { Link, usePage } from "@inertiajs/react";
import UserAvatar from './UserAvatar';
import GroupAvatar from './GroupAvatar';
import UserOptionsDropdown from './UserOptionsDropdown';

const ConversationItem = ({
    conversation,
    selectedConversation = null,
    online = null,
}) => {
    const page = usePage();
    const currentUser = page.props.auth.user;
    let classes = "border-transparent";
    if (selectedConversation) {
        if (!selectedConversation.is_group && !conversation.is_group && selectedConversation.id == conversation.id) {
            classes = "border-blue-500 bg-black/20";
        }
    }
    return <Link href={conversation.is_group
        ? route("chat.group", conversation)
        : route("chat.group", conversation)}
        preserveState
        className={"conversation-item flex items-center gap-2 p-2 text-gray-300 transition-all cursor-pointer border-l-4 hover:bg-black/30" + classes}
    ></Link>;
};