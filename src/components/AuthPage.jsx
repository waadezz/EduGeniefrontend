import React, { useState } from 'react';

const AuthPage = ({ onAuthenticate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Helper: get users list from localStorage
  const getUsers = () => JSON.parse(localStorage.getItem('users')) || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const users = getUsers();

    if (isLogin) {
      // Login flow: check if user exists and password matches
      const user = users.find(u => u.email === email);
      if (!user) {
        setError('User not found');
        return;
      }
      if (user.password !== password) {
        setError('Incorrect password');
        return;
      }
      // Login success: store logged in user email
      localStorage.setItem('loggedInUser', email);
      onAuthenticate(email); // send user email upwards
    } else {
      // Signup flow: check if email already exists
      if (users.some(u => u.email === email)) {
        setError('User already exists with this email');
        return;
      }
      // Add new user
      users.push({ email, password, name });
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('loggedInUser', email);
      onAuthenticate(email); // send user email upwards
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#f2f2f2] to-[#7030a0] w-full h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-[#012060] mb-6 text-center">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-[#012060] mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border-2 border-[#7030a0] rounded-xl focus:outline-none focus:border-[#012060]"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-[#012060] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-[#7030a0] rounded-xl focus:outline-none focus:border-[#012060]"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-[#012060] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-[#7030a0] rounded-xl focus:outline-none focus:border-[#012060]"
              required
            />
          </div>

          {error && <p className="text-red-600 mb-4 font-semibold">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-[#7030a0] text-white rounded-xl font-semibold hover:bg-[#012060] transition duration-300"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-[#012060]">
          {isLogin ? 'Need an account? ' : 'Already have an account? '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-[#7030a0] font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
