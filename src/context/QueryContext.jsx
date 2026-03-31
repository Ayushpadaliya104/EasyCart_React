import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchQueriesApi,
  createQueryApi,
  addQueryReplyApi,
  updateQueryStatusApi,
  markQueryReadByAdminApi,
  markQueriesReadByUserApi
} from '../services/queryService';

const QueryContext = createContext();

const normalizeQuery = (query) => ({
  ...query,
  replies: query.replies || [],
  unreadByAdmin: typeof query.unreadByAdmin === 'boolean' ? query.unreadByAdmin : !(query.replies || []).length,
  unreadByUser: typeof query.unreadByUser === 'boolean' ? query.unreadByUser : false,
});

export function QueryProvider({ children }) {
  const { user } = useAuth();
  const [queries, setQueries] = useState([]);

  const loadQueries = React.useCallback(async () => {
    if (!user) {
      setQueries([]);
      return;
    }

    try {
      const response = await fetchQueriesApi();
      setQueries((response.queries || []).map(normalizeQuery));
    } catch (_error) {
      setQueries([]);
    }
  }, [user]);

  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  const addQuery = async ({ subject, category, message }) => {
    if (!user) {
      throw new Error('Please login to submit a query');
    }

    const response = await createQueryApi({ subject, category, message });
    const nextQuery = normalizeQuery(response.query);
    setQueries((prev) => [nextQuery, ...prev]);
    return nextQuery.id;
  };

  const addReply = async (queryId, replyText, author = 'Admin') => {
    if (!replyText.trim()) {
      return;
    }

    const response = await addQueryReplyApi(queryId, { replyText, author });
    const updated = normalizeQuery(response.query);
    setQueries((prev) => prev.map((query) => (query.id === queryId ? updated : query)));
  };

  const updateStatus = async (queryId, status) => {
    const response = await updateQueryStatusApi(queryId, status);
    const updated = normalizeQuery(response.query);
    setQueries((prev) => prev.map((query) => (query.id === queryId ? updated : query)));
  };

  const markQueryReadByAdmin = async (queryId) => {
    const response = await markQueryReadByAdminApi(queryId);
    const updated = normalizeQuery(response.query);
    setQueries((prev) => prev.map((query) => (query.id === queryId ? updated : query)));
  };

  const markQueriesReadByUser = async (userEmail) => {
    if (!userEmail) {
      return;
    }

    await markQueriesReadByUserApi();
    setQueries((prev) =>
      prev.map((query) =>
        query.userEmail === userEmail
          ? { ...query, unreadByUser: false }
          : query
      )
    );
  };

  const getUnreadCountForAdmin = () => {
    return queries.filter((query) => query.unreadByAdmin).length;
  };

  const getUnreadCountForUser = (userEmail) => {
    if (!userEmail) {
      return 0;
    }

    return queries.filter((query) => query.userEmail === userEmail && query.unreadByUser).length;
  };

  return (
    <QueryContext.Provider
      value={{
        queries,
        addQuery,
        addReply,
        updateStatus,
        markQueryReadByAdmin,
        markQueriesReadByUser,
        getUnreadCountForAdmin,
        getUnreadCountForUser,
      }}
    >
      {children}
    </QueryContext.Provider>
  );
}

export function useQuery() {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error('useQuery must be used within QueryProvider');
  }
  return context;
}
