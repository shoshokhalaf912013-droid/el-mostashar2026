import React from "react"
import { Rnd } from "react-rnd"
import ScientificCalculator from "./ScientificCalculator"
import "./gold-ui.css"

export default function LessonTools({videoUrl}){

return(

<div className="lesson-container">

{/* الفيديو القابل للتحريك */}

<Rnd
default={{
x:20,
y:20,
width:700,
height:380
}}
bounds="parent"
enableResizing={true}
>

<div className="video-box">

<video
src={videoUrl}
controls
className="lesson-video"
/>

</div>

</Rnd>


{/* الآلة الحاسبة */}

<Rnd
default={{
x:760,
y:20,
width:360,
height:420
}}
bounds="parent"
enableResizing={true}
>

<div className="tools-panel">

<div className="tools-title">
الآلة الحاسبة العلمية
</div>

<ScientificCalculator/>

</div>

</Rnd>


{/* الأدوات */}

<Rnd
default={{
x:760,
y:460,
width:360,
height:250
}}
bounds="parent"
enableResizing={true}
>

<div className="tools-panel">

<div className="tools-title">
أدوات الدرس
</div>

<button className="gold-btn">رفع الفيديو</button>

<button className="gold-btn">حفظ رابط الفيديو</button>

<button className="gold-btn">فتح ملف PDF</button>

<button className="gold-btn">رفع ملف</button>

</div>

</Rnd>

</div>

)

}

