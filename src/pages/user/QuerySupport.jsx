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
    submitQueryRef.current = () => {
      addQuery(latestFormDataRef.current);
      setFormData((prev) => ({
        ...prev,
        subject: '',
        category: 'Order',
        message: '',
      }));
      setSuccessMessage('Query send ho gayi. Admin jaldi reply karega.');
      setTimeout(() => setSuccessMessage(''), 2500);
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
      submitHandler: () => {
        submitQueryRef.current();
      },
    });

    return () => {
      validator.destroy();
    };
  }, [addQuery]);

  return (
    <div className="min-h-screen bg-gray-50 page-enter">
      <Navbar />

      <section className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Send Query</h1>
            <p className="text-slate-600 mb-6">Share your issues, order problems, or general questions with us.</p>

            <form ref={formRef} className="space-y-4" noValidate>
              <input
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full border border-slate-300 rounded-xl px-4 py-2"
                required
              />
              <input
                name="userEmail"
                type="email"
                value={formData.userEmail}
                onChange={handleChange}
                placeholder="Your email"
                className="w-full border border-slate-300 rounded-xl px-4 py-2"
                required
              />
              <input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                className="w-full border border-slate-300 rounded-xl px-4 py-2"
                required
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-2"
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
                className="w-full border border-slate-300 rounded-xl px-4 py-2"
                required
              />

              <button
                type="submit"
                className="w-full bg-slate-900 text-white rounded-xl px-4 py-3 font-semibold hover:bg-slate-700 flex items-center justify-center gap-2"
              >
                <FiSend /> Send Query
              </button>
            </form>

            {successMessage && (
              <p className="mt-4 text-emerald-700 text-sm font-medium">{successMessage}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">My Queries</h2>
            {myQueries.length === 0 ? (
              <p className="text-slate-600">You have not submitted any queries yet.</p>
            ) : (
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                {myQueries.map((item) => (
                  <div key={item.id} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-900">{item.subject}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'Answered'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.status === 'Closed'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{item.message}</p>
                    <p className="text-xs text-slate-500 mb-2">{new Date(item.createdAt).toLocaleString()}</p>

                    <div className="space-y-2">
                      {item.replies.length === 0 ? (
                        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
                          Admin reply abhi pending hai.
                        </p>
                      ) : (
                        item.replies.map((reply) => (
                          <div key={reply.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
                            <p className="font-medium text-slate-800 mb-1">{reply.author} Reply</p>
                            <p className="text-slate-700">{reply.text}</p>
                            <p className="text-xs text-slate-500 mt-2">{new Date(reply.createdAt).toLocaleString()}</p>
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
