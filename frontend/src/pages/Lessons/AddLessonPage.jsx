import React, { useState } from "react";


const AddLessonPage = () => {
const [title, setTitle] = useState("");
const [pdf, setPdf] = useState(null);
const [video, setVideo] = useState(null);


const handleSubmit = (e) => {
e.preventDefault();
console.log({ title, pdf, video });
};


return (
<div className="page">
<h1>إضافة درس جديد</h1>


<form onSubmit={handleSubmit} className="form">
<label>عنوان الدرس:</label>
<input value={title} onChange={(e) => setTitle(e.target.value)} />


<label>رفع ملف PDF:</label>
<input type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files[0])} />


<label>رفع فيديو الدرس:</label>
<input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} />


<button className="btn primary">حفظ الدرس</button>
</form>
</div>
);
};
export default AddLessonPage;