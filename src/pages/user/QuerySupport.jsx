import React, { useEffect, useMemo, useRef, useState } from 'react';
import $ from 'jquery';
import 'jquery-validation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '../../context/QueryContext';
import { FiSend } from 'react-icons/fi';

function QuerySupport() {
  const { user } = useAuth();
  const { queries, addQuery, markQueriesReadByUser } = useQuery();

  const [formData, setFormData] = useState({
    userName: user?.name || '',
    userEmail: user?.email || '',
    subject: '',
    category: 'Order',
    message: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const formRef = useRef(null);
  const latestFormDataRef = useRef(formData);
  const submitQueryRef = useRef(() => {});

  const myQueries = useMemo(() => {
    if (!formData.userEmail) {
      return [];
    }

    return queries.filter((item) => item.userEmail === formData.userEmail);
  }, [queries, formData.userEmail]);

  useEffect(() => {
    if (formData.userEmail) {
      markQueriesReadByUser(formData.userEmail);
    }
  }, [formData.userEmail, queries, markQueriesReadByUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    latestFormDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      userName: user?.name || '',
      userEmail: user?.email || '',
    }));
  }, [user]);

  useEffect(() => {
    submitQueryRef.current = async () => {
      try {
        await addQuery(latestFormDataRef.current);
        setFormData((prev) => ({
          ...prev,
          subject: '',
          category: 'Order',
          message: '',
        }));
        setSuccessMessage('Your query has been sent. Admin will reply soon.');
        setTimeout(() => setSuccessMessage(''), 2500);
      } catch (_error) {
        setSuccessMessage(_error?.message || 'Query submission failed. Please try again.');
        setTimeout(() => setSuccessMessage(''), 2500);
      }
    };
  }, [addQuery]);

  useEffect(() => {
    if (!formRef.current) {
      return undefined;
    }

    const $form = $(formRef.current);
    const existingValidator = $form.data('validator');
    if (existingValidator) {
      existingValidator.destroy();
    }

    const validator = $form.validate({
      errorClass: 'error-message',
      errorElement: 'p',
      rules: {
        userName: {
          required: true,
          minlength: 2,
        },
        userEmail: {
          required: true,
          email: true,
        },
        subject: {
          required: true,
          minlength: 5,
        },
        category: {
          required: true,
        },
        message: {
          required: true,
          minlength: 10,
        },
      },
      messages: {
        userName: 'Please enter at least 2 characters for your name.',
        userEmail: 'Please enter a valid email address.',
        subject: 'Subject should be at least 5 characters.',
        category: 'Please select a category.',
        message: 'Message should be at least 10 characters.',
      },
      submitHandler: async (_form, event) => {
        if (event && typeof event.preventDefault === 'function') {
          event.preventDefault();
        }
        await submitQueryRef.current();
        return false;
      },
    });

    return () => {
      validator.destroy();
    };
  }, [addQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-cyan-50 to-indigo-100 page-enter">
      <Navbar />

      <section className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-white via-fuchsia-50 to-indigo-50 rounded-2xl border border-fuchsia-200 p-6 shadow-xl">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-fuchsia-700 via-indigo-700 to-cyan-700 bg-clip-text text-transparent mb-2">Send Query</h1>
            <p className="text-indigo-700 mb-6">Share your issues, order problems, or general questions with us.</p>

            <form
              ref={formRef}
              className="space-y-4"
              noValidate
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full border border-indigo-200 bg-white/90 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <input
                name="userEmail"
                type="email"
                value={formData.userEmail}
                onChange={handleChange}
                placeholder="Your email"
                className="w-full border border-indigo-200 bg-white/90 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                className="w-full border border-indigo-200 bg-white/90 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-indigo-200 bg-white/90 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="Order">Order</option>
                <option value="Payment">Payment</option>
                <option value="Delivery">Delivery</option>
                <option value="Product">Product</option>
                <option value="Other">Other</option>
              </select>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Explain your issue"
                rows={5}
                className="w-full border border-indigo-200 bg-white/90 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-cyan-600 text-white rounded-xl px-4 py-3 font-semibold hover:from-fuchsia-700 hover:via-indigo-700 hover:to-cyan-700 flex items-center justify-center gap-2 shadow-lg"
              >
                <FiSend /> Send Query
              </button>
            </form>

            {successMessage && (
              <p className="mt-4 text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-lg px-3 py-2 text-sm font-medium">{successMessage}</p>
            )}
          </div>

          <div className="bg-gradient-to-br from-white via-cyan-50 to-blue-50 rounded-2xl border border-cyan-200 p-6 shadow-xl">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-4">My Queries</h2>
            {myQueries.length === 0 ? (
              <p className="text-blue-700">You have not submitted any queries yet.</p>
            ) : (
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                {myQueries.map((item) => (
                  <div key={item.id} className="border border-blue-200 bg-white/80 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-900 text-lg">{item.subject}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'Answered'
                          ? 'bg-gradient-to-r from-emerald-200 to-green-200 text-emerald-800'
                          : item.status === 'Closed'
                            ? 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-700'
                            : 'bg-gradient-to-r from-amber-200 to-orange-200 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{item.message}</p>
                    <p className="text-xs text-blue-600 mb-2">{new Date(item.createdAt).toLocaleString()}</p>

                    <div className="space-y-2">
                      {item.replies.length === 0 ? (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                          Admin reply is pending.
                        </p>
                      ) : (
                        item.replies.map((reply) => (
                          <div key={reply.id} className="bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-200 rounded-lg p-3 text-sm">
                            <p className="font-semibold text-indigo-800 mb-1">{reply.author} Reply</p>
                            <p className="text-indigo-900">{reply.text}</p>
                            <p className="text-xs text-indigo-600 mt-2">{new Date(reply.createdAt).toLocaleString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default QuerySupport;
