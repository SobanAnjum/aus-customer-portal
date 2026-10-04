import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Calendar, 
  MessageSquare, 
  Send, 
  Clock, 
  User, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Shield, 
  CalendarDays,
  Sparkles,
  Ticket,
  AlertCircle,
  CheckCheck,
  Check,
  ShieldCheck,
  Search
} from 'lucide-react';
import { 
  UserProfile, 
  Appointment, 
  ChatRoom, 
  ChatMessage, 
  AppointmentStatus 
} from '../../types.ts';
import { 
  getOrCreateGeneralTicketRoom, 
  getOrCreateAppointmentChatRoom, 
  fetchChatMessages, 
  sendChatMessage, 
  subscribeToRoomMessages 
} from '../../lib/supabase.ts';
import { getApiUrl } from '../../lib/api.ts';
import { Language, translations } from '../../lib/translations.ts';

// WhatsApp-style Date Separator Formatter
const formatMessageDateHeader = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return 'Heute';

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    if (isYesterday) return 'Gestern';

    return d.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return 'Heute';
  }
};

// WhatsApp-style Delivery Status Indicator
const MessageStatusTick = ({ status }: { status?: 'sending' | 'sent' | 'delivered' | 'error' }) => {
  if (status === 'sending') {
    return <Clock className="w-3 h-3 text-slate-400 inline-block animate-spin" />;
  }
  if (status === 'error') {
    return <AlertCircle className="w-3 h-3 text-red-400 inline-block" title="Fehler beim Senden" />;
  }
  if (status === 'sent') {
    return <Check className="w-3.5 h-3.5 text-slate-400 inline-block" />;
  }
  return <CheckCheck className="w-3.5 h-3.5 text-cyan-400 inline-block" title="Zugestellt" />;
};

interface CustomerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSignOut: () => void;
  onCancelAppointment?: (aptId: number) => void;
  onJumpToCalendar?: (apt: Appointment) => void;
  lang?: Language;
}

export default function CustomerPortalModal({
  isOpen,
  onClose,
  currentUser,
  onSignOut,
  onCancelAppointment,
  onJumpToCalendar,
  lang = 'de',
}: CustomerPortalModalProps) {
  const t = translations[lang] || translations.de;

  // Navigation: 'appointments' or 'chat'
  const [activeTab, setActiveTab] = useState<'appointments' | 'chat'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingApts, setLoadingApts] = useState(false);

  // Chat State
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inChatSearch, setInChatSearch] = useState('');
  const [showInChatSearch, setShowInChatSearch] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load customer appointments
  useEffect(() => {
    if (!isOpen || !currentUser) return;
    setLoadingApts(true);

    fetch(getApiUrl(`/api/appointments?search=${encodeURIComponent(currentUser.email)}`))
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAppointments(data);
          buildChatRooms(data);
        }
      })
      .catch((err) => console.error('Failed to load user appointments:', err))
      .finally(() => setLoadingApts(false));
  }, [isOpen, currentUser]);

  // Build room list: 1 General Ticket room + 1 per appointment
  // Strictly isolates by passing currentUser.email!
  const buildChatRooms = async (apts: Appointment[]) => {
    try {
      const generalRoom = await getOrCreateGeneralTicketRoom(
        currentUser.id,
        `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        currentUser.email
      );

      const aptRooms: ChatRoom[] = [];
      for (const apt of apts) {
        const room = await getOrCreateAppointmentChatRoom(
          currentUser.id,
          apt.id,
          apt.title,
          currentUser.email
        );
        aptRooms.push(room);
      }

      const all = [generalRoom, ...aptRooms];
      setChatRooms(all);
      if (!selectedRoom && all.length > 0) {
        setSelectedRoom(all[0]);
      }
    } catch (e) {
      console.error('Failed to init rooms:', e);
    }
  };

  // Load messages when room changes
  useEffect(() => {
    if (!selectedRoom) return;
    setLoadingMessages(true);

    fetchChatMessages(selectedRoom.id).then((msgs) => {
      setMessages(msgs);
      setLoadingMessages(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    // Subscribe to realtime messages
    const sub = subscribeToRoomMessages(
      selectedRoom.id,
      (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => String(m.id) === String(newMsg.id))) return prev;
          return [...prev, { ...newMsg, status: 'delivered' }];
        });
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    );

    // Periodic polling fallback
    const intervalId = setInterval(() => {
      fetchChatMessages(selectedRoom.id).then((freshMsgs) => {
        if (Array.isArray(freshMsgs) && freshMsgs.length > 0) {
          setMessages((prev) => {
            const pendingOptimistic = prev.filter(
              (m) => String(m.id).startsWith('opt-') && !freshMsgs.some((fm) => fm.message === m.message)
            );
            const confirmedPrev = prev.filter((m) => !String(m.id).startsWith('opt-'));
            if (freshMsgs.length !== confirmedPrev.length || freshMsgs.some((m, i) => confirmedPrev[i]?.id !== m.id)) {
              return [...freshMsgs, ...pendingOptimistic];
            }
            return prev;
          });
        }
      }).catch(() => {});
    }, 3000);

    return () => {
      sub.unsubscribe();
      clearInterval(intervalId);
    };
  }, [selectedRoom]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedRoom) return;

    const text = inputText.trim();
    setInputText('');

    // 1. INSTANT OPTIMISTIC APPEARANCE (Status: sending / Clock icon)
    const tempId = 'opt-' + Date.now();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      roomId: selectedRoom.id,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
      senderRole: 'customer',
      message: text,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 30);

    // 2. DISPATCH TO BACKEND WITH STRICT SENDER ATTRIBUTION
    try {
      const sent = await sendChatMessage({
        roomId: selectedRoom.id,
        senderId: currentUser.id,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        senderRole: 'customer',
        message: text,
        clientEmail: currentUser.email,
        clientName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
      });

      // 3. FLIP OPTIMISTIC STATUS TO DELIVERED (Double Checkmark)
      setMessages((prev) => {
        const alreadyReceived = prev.some((m) => String(m.id) === String(sent.id));
        if (alreadyReceived) {
          return prev.filter((m) => m.id !== tempId);
        }
        return prev.map((m) => (m.id === tempId ? { ...sent, status: 'delivered' as const } : m));
      });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages((prev) => prev.map((m) => m.id === tempId ? { ...m, status: 'error' as const } : m));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xs font-sans">
      <div className="bg-slate-50 w-full max-w-5xl h-[88vh] rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm font-serif">
              {currentUser.firstName?.[0] || 'M'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-serif-title">
                  Mandantenportal
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> DATEV-Standard
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {currentUser.firstName} {currentUser.lastName} • {currentUser.email}
              </p>
            </div>
          </div>

          {/* Tab Switcher & Close */}
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('appointments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'appointments'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Termine ({appointments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat & Akten</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: Appointments List */}
        {activeTab === 'appointments' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-serif">
                Ihre gebuchten Termine
              </h4>
            </div>

            {loadingApts ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Termine werden geladen...
              </div>
            ) : appointments.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
                <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h5 className="text-sm font-bold text-slate-700">Keine aktiven Termine gefunden</h5>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Sie haben noch keine Termine mit Kanzleiinhaber Abdul Sattar vereinbart.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {apt.status}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {apt.bookingRef || `#${apt.id}`}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 font-serif">
                        {apt.title}
                      </h4>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{apt.date} • {apt.startTime} – {apt.endTime} Uhr</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Berater: <strong>Abdul Sattar</strong>
                      </span>
                      <button
                        onClick={() => {
                          const matchingRoom = chatRooms.find((r) => r.appointmentId === apt.id);
                          if (matchingRoom) setSelectedRoom(matchingRoom);
                          setActiveTab('chat');
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Zum Chat</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Multi-Room Chat & Dedicated Media Gallery */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Column: Room Directory */}
            <div className="w-64 bg-slate-100 border-r border-slate-200 flex flex-col shrink-0">
              <div className="p-3.5 border-b border-slate-200 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Kommunikationskanäle
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {chatRooms.length} {chatRooms.length === 1 ? 'Kanal' : 'Kanäle'}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {chatRooms.map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  const isGeneral = room.roomType === 'general_ticket';

                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {isGeneral ? (
                          <Ticket className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-blue-600'}`} />
                        ) : (
                          <Calendar className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        )}
                        <span className="text-xs font-bold truncate">
                          {isGeneral ? 'Allgemeiner Support' : room.title || 'Termin-Chat'}
                        </span>
                      </div>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isGeneral ? 'Offenes Ticket für Fragen' : `Termin #${room.appointmentId}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Active Room Messages & Document Gallery */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              {/* Room Top Bar with Tab Switcher */}
              <div className="px-6 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-serif shadow-xs">
                    AS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-serif">
                        <span>{selectedRoom?.title || 'Chatraum'}</span>
                      </h4>
                      <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 text-[9px] font-bold border border-blue-200 flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5 text-blue-600" />
                        <span>Kanzlei Abdul Sattar</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {selectedRoom?.roomType === 'general_ticket'
                        ? 'Direkter Mandanten-Support mit Kanzleiinhaber Abdul Sattar'
                        : `Ausschließlicher Chat- & Dokumentenkanal für Termin #${selectedRoom?.appointmentId}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Search Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowInChatSearch(!showInChatSearch)}
                    title="Nachrichten durchsuchen"
                    className={`p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      showInChatSearch || inChatSearch
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* In-Chat Search Bar Dropdown */}
              {showInChatSearch && (
                <div className="px-6 py-2 bg-slate-100/90 border-b border-slate-200 flex items-center gap-3 animate-in slide-in-from-top-1 duration-150">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="In dieser Unterhaltung suchen..."
                    value={inChatSearch}
                    onChange={(e) => setInChatSearch(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                  {inChatSearch && (
                    <span className="text-[11px] text-slate-500 font-medium shrink-0">
                      {messages.filter((m) => m.message.toLowerCase().includes(inChatSearch.toLowerCase())).length} Treffer
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setInChatSearch('');
                      setShowInChatSearch(false);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* CHAT VERLAUF */}
              <div className="flex-1 flex flex-col overflow-hidden">

                  {/* WhatsApp Styled Message Stream */}
                  <div 
                    className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1 bg-[#efeae2]/30"
                    style={{
                      backgroundImage: `radial-gradient(#cbd5e1 0.75px, transparent 0.75px)`,
                      backgroundSize: '24px 24px',
                    }}
                  >
                    {loadingMessages ? (
                      <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                        <span className="inline-block w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        <p className="font-medium text-slate-600">Nachrichten werden synchronisiert...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="py-20 text-center text-slate-400 text-xs space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs flex items-center justify-center mx-auto text-slate-400">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-slate-700 text-sm">Noch keine Nachrichten in diesem Raum</p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Ihre Nachrichten werden direkt und sicher mit der Kanzlei ausgetauscht.
                        </p>
                      </div>
                    ) : (
                      (() => {
                        const filteredList = inChatSearch.trim()
                          ? messages.filter((m) => m.message.toLowerCase().includes(inChatSearch.toLowerCase()))
                          : messages;

                        if (filteredList.length === 0) {
                          return (
                            <div className="py-12 text-center text-xs text-slate-500">
                              Keine Treffer für "{inChatSearch}" gefunden.
                            </div>
                          );
                        }

                        return filteredList.map((msg, idx) => {
                          const isMe = msg.senderRole === 'customer' || msg.senderId === currentUser.id;
                          const isAlert = msg.isHighAlert;

                          // Group by Date for WhatsApp Centered Date Badges
                          const prevMsg = idx > 0 ? filteredList[idx - 1] : null;
                          const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
                          const curDate = new Date(msg.createdAt).toDateString();
                          const showDateHeader = idx === 0 || prevDate !== curDate;

                          return (
                            <React.Fragment key={msg.id}>
                              {showDateHeader && (
                                <div className="flex justify-center my-3 sticky top-1 z-10 select-none">
                                  <span className="px-3.5 py-1 bg-white/95 backdrop-blur-md shadow-xs border border-slate-200/90 rounded-full text-[11px] font-semibold text-slate-600 tracking-wide">
                                    {formatMessageDateHeader(msg.createdAt)}
                                  </span>
                                </div>
                              )}

                              <div className={`flex flex-col mb-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
                                <div
                                  className={`relative max-w-[85%] sm:max-w-md md:max-w-lg px-3.5 py-2 rounded-2xl text-xs leading-relaxed shadow-xs transition-all ${
                                    isAlert
                                      ? 'bg-red-50 text-red-950 border-2 border-red-500 rounded-tl-xs'
                                      : isMe
                                      ? 'bg-slate-900 text-white rounded-tr-xs border border-slate-800'
                                      : 'bg-white text-slate-900 border border-slate-200/80 rounded-tl-xs'
                                  }`}
                                >
                                  {/* Kanzlei Header on Incoming Staff Messages */}
                                  {!isMe && (
                                    <div className="flex items-center gap-1.5 pb-1 mb-1 border-b border-slate-100">
                                      <span className="text-[11px] font-bold text-slate-900">
                                        {msg.senderName || 'Abdul Sattar (PhD, LL.M.)'}
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 text-[9px] font-bold border border-blue-200 flex items-center gap-0.5">
                                        <ShieldCheck className="w-2.5 h-2.5 text-blue-600" />
                                        <span>Kanzlei</span>
                                      </span>
                                    </div>
                                  )}

                                  {isAlert && (
                                    <div className="flex items-center gap-1 text-red-600 font-bold text-[10px] uppercase tracking-wider mb-1 bg-red-100/70 px-2 py-0.5 rounded-md">
                                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                      <span>Dringende Mitteilung der Kanzlei</span>
                                    </div>
                                  )}

                                  {/* Text Content */}
                                  <p className="whitespace-pre-wrap break-words text-[13px] leading-snug">{msg.message}</p>

                                  {/* WhatsApp Meta Footer: Timestamp + Delivery Ticks */}
                                  <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
                                    isMe ? 'text-slate-300' : 'text-slate-400'
                                  }`}>
                                    <span>
                                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && (
                                      <MessageStatusTick status={msg.status || 'delivered'} />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        });
                      })()
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* WhatsApp-Style Input Box */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white">
                    <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:bg-white focus-within:border-slate-900 transition-all">
                      <textarea
                        rows={1}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Nachricht an Kanzlei schreiben..."
                        className="flex-1 bg-transparent py-1.5 px-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none max-h-32 leading-relaxed"
                      />

                      <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="p-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl shadow-xs transition-all cursor-pointer shrink-0 active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 px-2 hidden sm:block">
                      Enter = Senden • Shift+Enter = Neue Zeile
                    </p>
                  </form>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
