import {
  CornerDownRight,
  CornerUpLeft,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  UserCircle,
  X,
} from "lucide-react";

import Link from "next/link";
import React, { useState } from "react";

const ChatSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  showAllUsers,
  setShowAllUsers,
  users,
  loggedInUser,
  chats,
  selectedUser,
  setSelectedUser,
  handleLogout,
  createChat,
  onlineUsers = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <aside
      className={`fixed z-20 sm:static top-0 left-0 h-screen w-80 bg-gray-900 border-r border-gray-700 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } sm:translate-x-0 transition-transform duration-300 flex flex-col`}
    >
      {/* header */}
      <div className="p-6 border-b border-gray-700">
        <div className="sm:hidden flex justify-end mb-2">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>

            <h2 className="text-xl font-bold text-white">
              {showAllUsers ? "New Chat" : "Messages"}
            </h2>
          </div>

          <button
            onClick={() => setShowAllUsers((prev) => !prev)}
            className={`p-2.5 rounded-lg transition ${
              showAllUsers
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } text-white`}
          >
            {showAllUsers ? (
              <X className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* content */}
      <div className="flex-1 overflow-hidden px-4 py-2">
        {showAllUsers ? (
          <div className="space-y-4 h-full">
            {/* search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                type="text"
                placeholder="Search Users..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* users */}
            <div className="space-y-2 overflow-y-auto h-full pb-4">
              {users
                ?.filter(
                  (u) =>
                    u._id !== loggedInUser?._id &&
                    u.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                )
                .map((u) => (
                  <button
                    key={u._id}
                    onClick={() => createChat(u)}
                    className="w-full text-left p-4 rounded-lg border border-gray-700 hover:bg-gray-800 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <UserCircle className="w-10 h-10 text-gray-300" />

                        {onlineUsers.includes(u._id) && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-gray-900"></span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-white font-medium truncate">
                          {u.name}
                        </div>

                        <div className="text-xs text-gray-400">
                              {onlineUsers.includes(u._id)
                            ? "Online"
                            : "Offline"}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ) : chats && chats.length > 0 ? (
          <div className="space-y-2 overflow-y-auto h-full pb-4">
            {chats.map((chat) => {
              const latestMessage = chat.chat.latestMessage;

              const isSelected =
                selectedUser === chat.chat._id;

              const isSentByMe =
                latestMessage?.sender ===
                loggedInUser?._id;

              const unseenCount =
                chat.chat.unseenCount || 0;

              return (
                <button
                  key={chat.chat._id}
                  onClick={() => {
                    setSelectedUser(chat.chat._id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left p-4 rounded-lg transition ${
                    isSelected
                      ? "bg-blue-600"
                      : "border border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* avatar */}
                    <div className="relative shrink-0">
                      <UserCircle className="w-10 h-10 text-gray-300" />

                      {onlineUsers.includes(chat.user._id) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-gray-900"></span>
                      )}
                    </div>

                    {/* info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col min-w-0">
                          {/* name */}
                          <span className="text-white font-semibold text-sm truncate">
                            {chat.user?.name}
                          </span>

                          {/* latest message */}
                          {latestMessage && (
                            <div className="flex items-center gap-1 text-xs text-gray-300 mt-1">
                              {isSentByMe ? (
                                <CornerUpLeft size={12} />
                              ) : (
                                <CornerDownRight size={12} />
                              )}

                              <span className="truncate">
                                {latestMessage.text}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* unseen count */}
                        {unseenCount > 0 && (
                          <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                            {unseenCount > 99
                              ? "99+"
                              : unseenCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle className="w-8 h-8 mb-2" />
            <p>No conversation yet</p>
          </div>
        )}
      </div>

      {/* footer */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <Link
          href="/profile"
          className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg text-white"
        >
          <UserCircle className="w-4 h-4" />
          Profile
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-600 hover:text-white rounded-lg"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default ChatSidebar;