import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CreateRoomModal from '@/widgets/CreateRoom/CreateRoom';
import ConnectRoomModal from '@widgets/Connect/ConnectRoom';
import { WS_URL, API_URL } from '@/env/api';
import { ru } from '@lang/ru.ts';
import { en } from '@lang/en.ts';

const language = localStorage.getItem('lang') || 'en';
const lang = language === 'ru' ? ru : en;

interface Room {
  Name:string
  RoomID: string
  Status: string
  MaxPlayers?: number
}

export default function LobbyContent() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/room/list`, {
      headers: {
        Authorization: localStorage.getItem('accessToken') || '',
      },
    })
      .then((res) => res.json())
      .then((data) => setRooms(data.rooms || []))
      .catch((err) => console.error('Failed to fetch rooms', err));
  }, []);

  const handleCreateRoom = (roomId: string) => {
    console.log('Room created:', roomId);
  };

  const handleConnectRoom = (roomId: string) => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    let userID = '';
    try {
      const parsed = JSON.parse(stored || '{}');
      userID = parsed?.id;
    } catch (e) {
      console.error('❌ Failed to parse user from localStorage', e);
      return;
    }

    if (!userID || !token) {
      console.error('❌ Missing userID or token');
      return;
    }

    const connector = WS_URL.includes('?') ? '&' : '?';
    const wsURL = `${WS_URL}${connector}roomID=${roomId}&token=${token}`;

    const socket = new WebSocket(wsURL);

    socket.onopen = () => console.log('✅ WebSocket connected');
    socket.onmessage = (event) => console.log('📨 Message:', event.data);
    socket.onerror = (error) => console.error('❌ WebSocket error:', error);
    socket.onclose = () => console.log('❎ WebSocket closed');

    navigate(`/table/${roomId}`);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-4xl font-bold text-pink-500 mb-4 text-center">
        {lang.lobby.pokerLobby}
      </h1>
      <p className="text-gray-400 text-sm mb-6 text-center">
        {lang.lobby.createTableDescription}
      </p>

      <div className="flex flex-row flex-wrap justify-center gap-8 mb-12">
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-pink-600 hover:bg-pink-700 rounded-xl shadow-md transition"
        >
          <FaPlus />
          {lang.lobby.createRoomButton}
        </button>
        <button
          onClick={() => setConnectModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-pink-600 hover:bg-pink-700 rounded-xl shadow-md transition"
        >
          <FaPlus />
          {lang.lobby.connectRoomButton}
        </button>
      </div>

      {rooms.length === 0 ? (
        <p className="text-center text-gray-500 italic mb-4">
          {lang.lobby.noRoomsMessage}
        </p>
      ) : (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 px-4 mb-12">
          {rooms.map((room: Room) => (
            <div key={room.RoomID} className="bg-black border border-pink-500 rounded-xl p-4 shadow-lg flex flex-col gap-2">
              <p className="text-lg font-semibold text-pink-400">{room.Name}</p>
              <p className="text-gray-300 text-sm">{lang.lobby.ID} {room.RoomID}</p>
              <p className="text-gray-400 text-sm">{lang.lobby.Status} {room.Status}</p>
              <p className="text-gray-400 text-sm">{lang.lobby.maxPlayers} {room.MaxPlayers }</p>
              <button
                onClick={() => handleConnectRoom(room.RoomID)}
                className="mt-2 bg-pink-600 hover:bg-pink-700 text-white py-1 px-4 rounded-lg text-sm font-medium transition"
              >
                {lang.lobby.Connect}
              </button>
            </div>
          ))}
        </div>
      )}

      <CreateRoomModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateRoom}
      />
      <ConnectRoomModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onConnect={handleConnectRoom}
      />
    </div>
  );
}
