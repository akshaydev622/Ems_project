import React, { useState, useEffect } from "react";
import { Search, Maximize, Minimize, Sun, Moon, CalendarHeart, Bell, Settings, Menu, ChevronLeft, Command, X, Clock, } from "lucide-react";

const notifications = [
  {
    id: 1,
    name: "Daniel Martinz",
    message: (
      <>
        <span className="font-medium text-gray-800">Daniel Martinz</span>{" "}
        requested Sick Leave from May 28 2025 to May 29 2025
      </>
    ),
    time: "4 min ago",
  },
  {
    id: 2,
    name: "Emily Clark",
    message: (
      <>
        Leave for{" "}
        <span className="font-medium text-gray-800">Emily Clark</span> has
        been approved.
      </>
    ),
    time: "8 min ago",
  },
  {
    id: 3,
    name: "David Anderson",
    message: (
      <>
        Leave request from{" "}
        <span className="font-medium text-gray-800">David Anderson</span> has
        been rejected.
      </>
    ),
    time: "15 min ago",
  },
  {
    id: 4,
    name: "Ann McClure",
    message: (
      <>
        cancelled her appointment scheduled for{" "}
        <span className="font-medium text-gray-800">February 5, 2024</span>
      </>
    ),
    time: "20 min ago",
  },
];

const TopHeader = ({ setMobileOpen }) => {
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [items, setItems] = useState(notifications);

  const removeNotification = (id) =>
    setItems((prev) => prev.filter((n) => n.id !== id));

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = (e) => {
    e.preventDefault();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden cursor-pointer mr-1"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Sidebar collapse toggle */}


          {/* Search */}
          <div className="ml-2 hidden items-center lg:flex">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search Keyword"
                className="w-64 rounded-md border border-gray-300 bg-gray-50 py-2 pl-9 pr-9 text-sm text-gray-700 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                <Command className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Mobile search button */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer"
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>

          {/* Dark / Light mode toggle */}
          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            className="hidden h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 sm:inline-flex"
          >
            {darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Calendar */}
          <a
            href="#"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
          >
            <CalendarHeart className="h-4 w-4" />
          </a>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-md border border-gray-200 bg-white shadow-lg sm:w-96">
                <div className="border-b border-gray-200 p-3">
                  <h6 className="text-base font-semibold text-gray-800">
                    Notifications
                  </h6>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {items.map((n) => (
                    <div
                      key={n.id}
                      className="flex border-b border-gray-100 px-3 py-3 last:border-b-0"
                    >
                      <div className="mr-3 flex-shrink-0">
                        {/* <img className="h-10 w-10 rounded-full" alt="" src="/assets/img/users/avatar.jpg" /> */}
                        <div className="h-10 w-10 rounded-full bg-gray-200" />
                      </div>
                      <div className="flex-1">
                        <p className="mb-0 text-sm font-medium text-gray-800">
                          {n.name}
                        </p>
                        <p className="mb-1 text-sm text-gray-600">
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center text-xs text-gray-400">
                            <Clock className="mr-1 h-3 w-3" />
                            {n.time}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              title="Mark as Read"
                              aria-label="Mark as Read"
                              className="h-2.5 w-2.5 rounded-full bg-red-500"
                            ></button>
                            <button
                              onClick={() => removeNotification(n.id)}
                              className="rounded-full p-0.5 text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-b-md border-t border-gray-200 p-2 text-center">
                  <a
                    href="/notifications"
                    className="text-sm font-medium text-indigo-600 underline hover:text-indigo-700"
                  >
                    View All Notifications
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <a
            href="/settings"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Settings className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}

export default TopHeader;