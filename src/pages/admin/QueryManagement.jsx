import React, { useEffect, useMemo, useState } from 'react';
import { FiSend } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import { useQuery } from '../../context/QueryContext';

function QueryManagement() {
  const { queries, addReply, updateStatus, markQueryReadByAdmin } = useQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [replyText, setReplyText] = useState('');

  const filteredQueries = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return queries.filter(
      (item) =>
        item.subject.toLowerCase().includes(term) ||
        item.userEmail.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term)
    );
  }, [queries, searchTerm]);

  const selectedQuery = filteredQueries.find((item) => item.id === selectedId) || filteredQueries[0];

  useEffect(() => {
    if (selectedQuery?.id) {
      markQueryReadByAdmin(selectedQuery.id);
    }
  }, [selectedQuery?.id, markQueryReadByAdmin]);

  const handleReply = async () => {
    if (!selectedQuery || !replyText.trim()) {
      return;
    }

    try {
      await addReply(selectedQuery.id, replyText, 'Admin');
      setReplyText('');
    } catch (_error) {
    }
  };

  const handleStatusChange = async (queryId, status) => {
    try {
      await updateStatus(queryId, status);
    } catch (_error) {
    }
  };

  return (
    <AdminLayout
      title="Query Management"
      subtitle="View user queries, update status, and send direct replies."
      activePath="/admin/queries"
    >
      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by id, subject, email"
            className="w-full border border-slate-300 rounded-xl px-4 py-2 mb-4"
          />

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredQueries.length === 0 ? (
              <p className="text-slate-600">No queries found.</p>
            ) : (
              filteredQueries.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left border rounded-xl p-4 transition ${
                    selectedQuery?.id === item.id
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-semibold">{item.subject}</p>
                  <p className={`text-xs mt-1 ${selectedQuery?.id === item.id ? 'text-slate-200' : 'text-slate-500'}`}>
                    {item.id} · {item.userEmail}
                  </p>
                  <p className={`text-xs mt-1 ${selectedQuery?.id === item.id ? 'text-slate-200' : 'text-slate-500'}`}>
                    Status: {item.status}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="xl:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          {!selectedQuery ? (
            <p className="text-slate-600">Select a query to view details.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-slate-500">{selectedQuery.id}</p>
                  <h3 className="text-xl font-bold text-slate-900">{selectedQuery.subject}</h3>
                  <p className="text-sm text-slate-600">
                    {selectedQuery.userName} · {selectedQuery.userEmail}
                  </p>
                </div>
                <select
                  value={selectedQuery.status}
                  onChange={(e) => handleStatusChange(selectedQuery.id, e.target.value)}
                  className="border border-slate-300 rounded-xl px-3 py-2"
                >
                  <option value="Open">Open</option>
                  <option value="Answered">Answered</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
                <p className="text-sm font-medium text-slate-500 mb-1">User Message</p>
                <p className="text-slate-800">{selectedQuery.message}</p>
              </div>

              <div className="space-y-3 mb-5 max-h-[300px] overflow-y-auto pr-1">
                {selectedQuery.replies.length === 0 ? (
                  <p className="text-sm text-slate-600">No replies yet.</p>
                ) : (
                  selectedQuery.replies.map((reply) => (
                    <div key={reply.id} className="border border-slate-200 rounded-xl p-3">
                      <p className="text-sm font-medium text-slate-800">{reply.author}</p>
                      <p className="text-slate-700 text-sm mt-1">{reply.text}</p>
                      <p className="text-xs text-slate-500 mt-2">{new Date(reply.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  placeholder="Type admin reply"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2"
                />
                <button
                  onClick={handleReply}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-700 flex items-center gap-2"
                >
                  <FiSend /> Send Reply
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}

export default QueryManagement;
