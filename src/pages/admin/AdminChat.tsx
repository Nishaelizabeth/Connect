import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  getAdminChatRooms,
  getAdminMessages,
  type AdminChatRoom,
  type AdminMessage,
} from '@/api/admin.api';

const AdminChat: React.FC = () => {
  const [rooms, setRooms] = useState<AdminChatRoom[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAdminChatRooms();
        setRooms(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loadMessages = async (roomId: number) => {
    setSelectedRoom(roomId);
    try {
      const data = await getAdminMessages(roomId);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chat Moderation</h1>
        <p className="text-gray-500 text-sm">Monitor chat rooms and messages across trips.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat rooms */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Chat Rooms</h2>
          </div>
          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : rooms.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No chat rooms.</div>
            ) : (
              rooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => loadMessages(r.id)}
                  className={`w-full text-left px-5 py-3 hover:bg-gray-50 transition ${
                    selectedRoom === r.id ? 'bg-blue-50 border-l-2 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-gray-900 text-sm">{r.trip_title}</span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {r.message_count} msgs
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Created {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              {selectedRoom ? `Messages — Room #${selectedRoom}` : 'Select a chat room'}
            </h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto p-4 space-y-3">
            {!selectedRoom ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Select a chat room to view messages</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No messages in this room.</div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl text-sm ${
                    m.is_system
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-gray-50 border border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">
                      {m.is_system ? '🤖 System' : m.sender_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{m.content}</p>
                  {m.message_type !== 'text' && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-[11px] rounded">
                      {m.message_type}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminChat;
