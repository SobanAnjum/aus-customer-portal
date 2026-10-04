import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  MessageSquare, 
  Send, 
  FileText, 
  Clock, 
  User, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Shield, 
  Download, 
  CalendarDays, 
  Sparkles, 
  Ticket, 
  LogOut, 
  Building, 
  Phone, 
  Home, 
  Mail,
  ExternalLink,
  ShieldCheck,
  Search,
  CheckCheck,
  Check,
  AlertCircle,
  X
} from 'lucide-react';
import { 
  UserProfile, 
  Appointment, 
  ChatRoom, 
  ChatMessage, 
  AppointmentDocument, 
  AppointmentStatus 
} from '../../types.ts';
import { 
  getOrCreateGeneralTicketRoom, 
  getOrCreateAppointmentChatRoom, 
  fetchChatMessages, 
  sendChatMessage, 
  subscribeToRoomMessages, 
  fetchAppointmentDocuments,
  upsertUserProfile 
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

// Dashboard Sub-components
import CustomerSidebar, { CustomerDashboardTab } from './dashboard/CustomerSidebar.tsx';
import CustomerHeader from './dashboard/CustomerHeader.tsx';
import CustomerOverviewTab from './dashboard/CustomerOverviewTab.tsx';
import CustomerAppointmentsTab from './dashboard/CustomerAppointmentsTab.tsx';
import CustomerAnalyticsTab from './dashboard/CustomerAnalyticsTab.tsx';
import CustomerProfileTab from './dashboard/CustomerProfileTab.tsx';

interface CustomerDashboardViewProps {
  currentUser: UserProfile;
  onStartBooking: (serviceId?: string) => void;
  onNavigateWebsite?: () => void;
  onSignOut: () => void;
  lang?: Language;
  onChangeLanguage?: (lang: Language) => void;
}

export default function CustomerDashboardView({
  currentUser,
  onStartBooking,
  onNavigateWebsite = () => {},
  onSignOut,
  lang = 'de',
  onChangeLanguage = () => {},
}: CustomerDashboardViewProps) {
  const t = translations[lang] || translations.de;

  // Active Main Navigation Tab: 'overview' | 'appointments' | 'analytics' | 'chat' | 'profile'
  const [activeTab, setActiveTab] = useState<CustomerDashboardTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Appointments Data State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingApts, setLoadingApts] = useState(false);
  const [targetAppointment, setTargetAppointment] = useState<Appointment | null>(null);

  // Chat & Room State
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inChatSearch, setInChatSearch] = useState('');
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [allDocuments, setAllDocuments] = useState<AppointmentDocument[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load Customer Appointments
  const loadAppointments = () => {
    if (!currentUser) return;
    setLoadingApts(true);

    fetch(getApiUrl(`/api/appointments?search=${encodeURIComponent(currentUser.email)}`))
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAppointments(data);
          buildChatRooms(data);
        } else {
          buildChatRooms([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load user appointments:', err);
        buildChatRooms([]);
      })
      .finally(() => setLoadingApts(false));
  };

  useEffect(() => {
    loadAppointments();
  }, [currentUser]);

  // Cancel an appointment
  const handleCancelAppointment = async (aptId: number) => {
    if (!window.confirm('Möchten Sie diesen Beratungstermin wirklich verbindlich stornieren?')) {
      return;
    }

    try {
      const res = await fetch(getApiUrl(`/api/appointments/${aptId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Storniert' }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === aptId ? { ...a, status: 'Storniert' as AppointmentStatus } : a))
        );
      }
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
    }
  };

  // Build Room List (General Ticket + 1 room per booked appointment)
  // Strictly isolates by passing currentUser.email!
  const buildChatRooms = async (apts: Appointment[]) => {
    try {
      const generalRoom = await getOrCreateGeneralTicketRoom(
        currentUser.id, 
        `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        currentUser.email
      );
      const rooms: ChatRoom[] = [generalRoom];

      for (const apt of apts) {
        const aptRoom = await getOrCreateAppointmentChatRoom(
          currentUser.id,
          apt.id,
          apt.title,
          currentUser.email
        );
        rooms.push(aptRoom);
      }

      setChatRooms(rooms);
      if (!selectedRoom && rooms.length > 0) {
        setSelectedRoom(rooms[0]);
      }
    } catch (err) {
      console.error('Error building chat rooms:', err);
    }
  };

  // Load Messages & Documents when selected room changes
  useEffect(() => {
    if (!selectedRoom) return;
    setLoadingMessages(true);

    fetchChatMessages(selectedRoom.id)
      .then((msgs) => {
        setMessages(msgs);
      })
      .catch((err) => console.error('Error fetching messages:', err))
      .finally(() => setLoadingMessages(false));

    // Fetch documents for the room / appointment
    fetchAppointmentDocuments(selectedRoom.appointmentId || null, selectedRoom.id)
      .then((docs) => {
        setAllDocuments((prev) => {
          const ids = new Set(prev.map(d => d.id));
          const newDocs = docs.filter(d => !ids.has(d.id));
          return [...newDocs, ...prev];
        });
      })
      .catch((err) => console.error('Error fetching documents:', err));

    // Subscribe to real-time messages
    const subscription = subscribeToRoomMessages(
      selectedRoom.id,
      (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => String(m.id) === String(newMsg.id))) return prev;
          return [...prev, { ...newMsg, status: 'delivered' }];
        });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedRoom]);

  // Periodic polling fallback for active chat room
  useEffect(() => {
    if (!selectedRoom) return;

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

    return () => clearInterval(intervalId);
  }, [selectedRoom]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send Message with Optimistic Delivery (WhatsApp Grade)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedRoom) return;

    const textToSend = inputText.trim();
    setInputText('');

    // 1. INSTANT OPTIMISTIC APPEARANCE (Status: sending / Clock icon)
    const tempId = 'opt-' + Date.now();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      roomId: selectedRoom.id,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
      senderRole: 'customer',
      message: textToSend,
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
        message: textToSend,
        clientEmail: currentUser.email,
        clientName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
      });

      // 3. FLIP OPTIMISTIC STATUS TO DELIVERED (Double Checkmark)
      setMessages((prev) => {
        if (prev.some((m) => String(m.id) === String(sent.id))) {
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

  // Open Chat for specific appointment
  const openAppointmentChat = (apt: Appointment) => {
    const matchingRoom = chatRooms.find((r) => r.appointmentId === apt.id);
    if (matchingRoom) {
      setSelectedRoom(matchingRoom);
    }
    setActiveTab('chat');
  };

  // Update Profile
  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    const merged: UserProfile = {
      ...currentUser,
      ...updated,
    };

    await upsertUserProfile({
      id: currentUser.id,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      phone: merged.phone || '',
      homeAddress: merged.homeAddress || '',
      companyName: merged.companyName || undefined,
      role: currentUser.role || 'customer',
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex font-sans" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* Persistent Left Business Sidebar */}
      <CustomerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        appointmentsCount={appointments.length}
        roomsCount={chatRooms.length}
        onStartBooking={onStartBooking}
        onNavigateWebsite={onNavigateWebsite}
        onSignOut={onSignOut}
        lang={lang}
        onChangeLanguage={onChangeLanguage}
        mobileSidebarOpen={mobileSidebarOpen}
        onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area (offset by 64 Tailwind units = 256px on desktop) */}
      <div className={`flex-1 flex flex-col min-w-0 ${lang === 'ur' ? 'lg:mr-64' : 'lg:ml-64'}`}>
        {/* Top Executive Header with Prominent Client Name */}
        <CustomerHeader
          currentUser={currentUser}
          searchQuery={globalSearchQuery}
          setSearchQuery={setGlobalSearchQuery}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onStartBooking={onStartBooking}
          onNavigateProfile={() => setActiveTab('profile')}
          onSignOut={onSignOut}
          lang={lang}
        />

        {/* Tab Workspace Views */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {/* TAB 1: ÜBERSICHT (COCKPIT) */}
          {activeTab === 'overview' && (
            <CustomerOverviewTab
              currentUser={currentUser}
              appointments={appointments}
              documents={allDocuments}
              roomsCount={chatRooms.length}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onNavigateToCalendar={(apt) => {
                setTargetAppointment(apt);
                setActiveTab('appointments');
              }}
              onStartBooking={onStartBooking}
              lang={lang}
            />
          )}

          {/* TAB 2: TERMINE & STATUS */}
          {activeTab === 'appointments' && (
            <CustomerAppointmentsTab
              appointments={appointments}
              loading={loadingApts}
              onOpenChat={openAppointmentChat}
              onCancelAppointment={handleCancelAppointment}
              onStartBooking={onStartBooking}
              targetAppointment={targetAppointment}
              onClearTargetAppointment={() => setTargetAppointment(null)}
              lang={lang}
            />
          )}

          {/* TAB 3: ANALYSEN & GRAFIKEN */}
          {activeTab === 'analytics' && (
            <CustomerAnalyticsTab
              currentUser={currentUser}
              appointments={appointments}
              documents={allDocuments}
              lang={lang}
            />
          )}

          {/* TAB 4: CHAT & AKTEN */}
          {activeTab === 'chat' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row h-[78vh]">
              {/* Left Sidebar: Room Selector */}
              <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-200 bg-white">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {t.dash_chat_title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t.dash_chat_subtitle}
                  </p>
                </div>

                <div className="p-2.5 space-y-1.5 overflow-y-auto flex-1">
                  {chatRooms.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      ...
                    </div>
                  ) : (
                    chatRooms.map((room) => {
                      const isSelected = selectedRoom?.id === room.id;
                      return (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'hover:bg-slate-200/60 text-slate-800'
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                            {room.roomType === 'general_ticket' ? <Ticket className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold truncate block">
                              {room.title}
                            </span>
                            <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                              {room.roomType === 'general_ticket' ? t.dash_chat_general_ticket : t.dash_chat_appointment_ticket}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Chat & Gallery Area */}
              <div className="flex-1 flex flex-col bg-white overflow-hidden">
                {/* Room Top Bar with Tab Switcher & Search */}
                <div className="px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm font-serif shadow-xs">
                      AS
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-950 font-serif">
                          {selectedRoom?.title || t.dash_chat_title}
                        </h3>
                        <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          <span>Kanzlei Abdul Sattar</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        <span>Rechtssicher & verschlüsselt</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-400">
                          {selectedRoom?.roomType === 'general_ticket' ? 'Allgemeiner Support' : `Termin #${selectedRoom?.appointmentId}`}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Search Toggle */}
                    <button
                      onClick={() => setShowInChatSearch(!showInChatSearch)}
                      title="Nachrichten durchsuchen"
                      className={`p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        showInChatSearch || inChatSearch
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Search className="w-4 h-4" />
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

                    {/* WhatsApp Styled Message Thread */}
                    <div 
                      className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-1 bg-[#efeae2]/30"
                      style={{
                        backgroundImage: `radial-gradient(#cbd5e1 0.75px, transparent 0.75px)`,
                        backgroundSize: '24px 24px',
                      }}
                    >
                      {loadingMessages ? (
                        <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 space-y-2">
                          <span className="inline-block w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                          <p className="font-medium text-slate-600">Nachrichten werden synchronisiert...</p>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                          <div className="w-12 h-12 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs flex items-center justify-center mx-auto text-slate-400">
                            <MessageSquare className="w-6 h-6" />
                          </div>
                          <h4 className="text-xs font-bold text-slate-700">{t.dash_chat_no_files}</h4>
                          <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                            {t.dash_chat_subtitle}
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
                                        <span>Dringende Benachrichtigung der Kanzlei</span>
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
                          placeholder={t.dash_chat_placeholder || 'Nachricht an Kanzlei schreiben...'}
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

          {/* TAB 5: MEIN PROFIL */}
          {activeTab === 'profile' && (
            <CustomerProfileTab
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onSignOut={onSignOut}
              lang={lang}
            />
          )}
        </main>
      </div>
    </div>
  );
}
