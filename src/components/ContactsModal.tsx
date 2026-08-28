import React, { useState } from 'react';
import { X, Users, Mail, Phone, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { signInWithGoogleContacts, auth, logOutUser } from '../lib/firebase.ts';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GoogleContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
}

export const ContactsModal: React.FC<ContactsModalProps> = ({ isOpen, onClose }) => {
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectGoogleContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { user, token } = await signInWithGoogleContacts();
      if (!token) {
        throw new Error("No access token returned from Google Sign-In");
      }
      setAuthToken(token);
      setConnected(true);

      // Fetch contacts from backend
      const res = await fetch('/api/contacts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch contacts from Google People API');
      }

      const data = await res.json();
      setContacts(data.contacts || []);
    } catch (err: any) {
      console.error("Contacts connection error:", err);
      setError(err.message || "Failed to connect Google Contacts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-base">Google Contacts Integration</h3>
              <p className="text-xs text-stone-500">Sync & discover friends from your Google account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {!connected ? (
            <div className="text-center py-8 px-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-semibold text-stone-900 mb-2">Connect Your Google Contacts</h4>
              <p className="text-sm text-stone-500 max-w-sm mb-6">
                Grant secure access to sync your Google contacts, view friends, and easily connect within Blaze.
              </p>
              <button
                onClick={handleConnectGoogleContacts}
                disabled={loading}
                className="w-full max-w-xs bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Sign In & Sync Contacts
                  </>
                )}
              </button>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl max-w-sm">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Successfully synced {contacts.length} Google Contacts
                </span>
                <button
                  onClick={handleConnectGoogleContacts}
                  disabled={loading}
                  className="text-emerald-700 hover:text-emerald-900 underline font-medium"
                >
                  Refresh
                </button>
              </div>

              {contacts.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-sm">
                  No contacts found in your Google account.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-stone-100 hover:border-orange-200 bg-stone-50/50 hover:bg-orange-50/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {contact.photoUrl ? (
                          <img
                            src={contact.photoUrl}
                            alt={contact.name}
                            className="w-10 h-10 rounded-full object-cover border border-stone-200"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-sm">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h5 className="font-medium text-stone-900 text-sm">{contact.name}</h5>
                          <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                            {contact.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-stone-400" /> {contact.email}
                              </span>
                            )}
                            {contact.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-stone-400" /> {contact.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Invitation sent to ${contact.name}!`)}
                        className="bg-white hover:bg-orange-600 hover:text-white border border-stone-200 hover:border-orange-600 text-stone-700 text-xs font-medium py-1.5 px-3 rounded-lg transition-colors shadow-sm"
                      >
                        Invite
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>Secured via Google People API & OAuth</span>
          <button
            onClick={onClose}
            className="font-medium text-stone-700 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-200/50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
