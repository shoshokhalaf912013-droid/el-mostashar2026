import React from 'react';

function LoginRegister() {
  return (
    <div className="flex justify-center items-center gap-4 mt-10">
      <button className="bg-gold text-black px-6 py-3 rounded hover:bg-yellow-400 transition">تسجيل دخول</button>
      <button className="bg-black border border-gold text-gold px-6 py-3 rounded hover:bg-gold hover:text-black transition">تسجيل جديد</button>
    </div>
  );
}

export default LoginRegister;
