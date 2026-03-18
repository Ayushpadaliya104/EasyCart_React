import React, { createContext, useContext, useEffect, useState } from 'react';

const QueryContext = createContext();

const normalizeQuery = (query) => ({
  ...query,
  replies: query.replies || [],
  unreadByAdmin: typeof query.unreadByAdmin === 'boolean' ? query.unreadByAdmin : !(query.replies || []).length,
  unreadByUser: typeof query.unreadByUser === 'boolean' ? query.unreadByUser : false,
});

export function QueryProvider({ children }) {
  const [queries, setQueries] = useState(() => {
    const saved = localStorage.getItem('queries');
    return saved ? JSON.parse(saved).map(normalizeQuery) : [];
  });

  useEffect(() => {
    localStorage.setItem('queries', JSON.stringify(queries));
  }, [queries]);

  const addQuery = ({ userName, userEmail, subject, category, message }) => {
    const nextQuery = {
      id: `Q-${Date.now()}`,
      userName,
      userEmail,
      subject,
      category,
      message,
      status: 'Open',
      createdAt: new Date().toISOString(),
      replies: [],
      unreadByAdmin: true,
      unreadByUser: false,
    };

    setQueries((prev) => [nextQuery, ...prev]);
    return nextQuery.id;
  };

  const addReply = (queryId, replyText, author = 'Admin') => {
    if (!replyText.trim()) {
      return;
    }

    setQueries((prev) =>
      prev.map((query) => {
        if (query.id !== queryId) {
          return query;
        }

        return {
          ...query,
          status: 'Answered',
          unreadByAdmin: false,
          unreadByUser: true,
          replies: [
            ...query.replies,
            {
              id: `R-${Date.now()}`,
              text: replyText.trim(),
              author,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  const updateStatus = (queryId, status) => {
    setQueries((prev) =>
      prev.map((query) => (query.id === queryId ? { ...query, status } : query))
    );
  };

  const markQueryReadByAdmin = (queryId) => {
    setQueries((prev) => {
      let hasChange = false;
      const next = prev.map((query) => {
        if (query.id !== queryId || !query.unreadByAdmin) {
          return query;
        }

        hasChange = true;
        return { ...query, unreadByAdmin: false };
      });

      return hasChange ? next : prev;
    });
  };

  const markQueriesReadByUser = (userEmail) => {
    if (!userEmail) {
      return;
    }

    setQueries((prev) => {
      let hasChange = false;
      const next = prev.map((query) => {
        if (query.userEmail !== userEmail || !query.unreadByUser) {
          return query;
        }

        hasChange = true;
        return { ...query, unreadByUser: false };
      });

      return hasChange ? next : prev;
    });
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
