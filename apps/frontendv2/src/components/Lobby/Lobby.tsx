import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CreateRoomModal from '@/widgets/CreateRoom/CreateRoom';
import ConnectRoomModal from '@widgets/Connect/ConnectRoom';
import { API_URL } from '@/env/api';
import { ru } from '@lang/ru.ts';
import { en } from '@lang/en.ts';
import { useToast } from '@hooks/useToast.ts';

const language = localStorage.getItem('lang') || 'en';
const lang = language === 'ru' ? ru : en;

interface Room {
  Name: string;
  RoomID: string;
  Status: string;
  MaxPlayers?: number;
}

export default function LobbyContent() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const toast = useToast(); // ✅ здесь правильно

  useEffect(() => {
    fetch(`${API_URL}/room/list`, {
      headers: {
        Authorization: localStorage.getItem('accessToken') || '',
      },
    })
      .then((res) => res.json())
      .then((data) => setRooms(data.rooms || []))
      .catch((err) => {
        toast.error('❌ Failed to fetch rooms');
        console.error(err);
      });
  }, []);

  const handleCreateRoom = (roomId: string) => {
    console.log('Room created:', roomId);
  };

  const handleConnectRoom = async (roomId: string) => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    let userID = '';
    try {
      const parsed = JSON.parse(stored || '{}');
      userID = parsed?.id;
    } catch (e) {
      console.error('❌ JSON parse error', e);
      toast.error(lang.errors.invalidUserData || 'Ошибка чтения данных пользователя');
    }

    if (!userID || !token) {
      toast.error(lang.errors?.missingToken || 'Нет токена или ID пользователя');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: token,
        },
      });

      if (!res.ok) {
        toast.error(lang.errors?.failedToFetchUser || 'Не удалось получить данные пользователя');
        return;
      }

      const data = await res.json();
      const balance = parseInt(data?.balance || '0');

      if (isNaN(balance) || balance < 500) {
        toast.warning(lang.lobby?.notEnoughBalance || 'Недостаточно монет для входа (нужно минимум 500)');
        return;
      }

      navigate(`/table/${roomId}`);
    } catch (err) {
      toast.error(lang.errors?.failedToFetch || 'Ошибка при получении баланса');
      console.error('❌ Failed to fetch balance:', err);
    }
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
              <p className="text-gray-400 text-sm">{lang.lobby.maxPlayers} {room.MaxPlayers}</p>
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
