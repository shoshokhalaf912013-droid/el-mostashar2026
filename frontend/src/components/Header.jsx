import React from 'react';
import teacherImg from '../assets/teacher.png';

function Header() {
  return (
    <header className="flex justify-between items-center p-4 border-b border-gold">
      <img src={teacherImg} alt="مدرس" className="h-16 w-16 rounded-full" />
      <h1 className="text-3xl font-bold">المستشار 2026</h1>
    </header>
  );
}

export default Header;
