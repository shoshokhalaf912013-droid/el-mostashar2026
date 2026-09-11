import React, { useState, useRef } from "react";

export default function ScientificCalculator(){
const [tab,setTab] = useState("calc");
const [input,setInput] = useState("");
const [history,setHistory] = useState([]);
const [pos,setPos] = useState({x:500,y:380});
const dragging = useRef(false);
const offset = useRef({x:0,y:0});

/////////////////////////////////////////////////

/* تخزين المصفوفة */

const [matrix,setMatrix] = useState([
["","",""],
["","",""],
["","",""]
]);

function updateMatrix(r,c,val){
const copy = matrix.map(row => [...row]);
copy[r][c] = val;
setMatrix(copy);
}

function determinant(){
const m = matrix.map(row => row.map(Number));

const det =
m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-
m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+
m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);

setInput(det.toString());
}

function loadMatrix(){
setInput(JSON.stringify(matrix));
}

/////////////////////////////////////////////////

function startDrag(e){
dragging.current=true;
offset.current={
x:e.clientX-pos.x,
y:e.clientY-pos.y
};
}

function drag(e){
if(!dragging.current) return;

setPos({
x:e.clientX-offset.current.x,
y:e.clientY-offset.current.y
});
}

function stopDrag(){
dragging.current=false;
}

/////////////////////////////////////////////////

function add(val){
setHistory([...history,input]);
setInput(input + val);
}

function undo(){
if(history.length===0) return;

const last = history[history.length-1];
setHistory(history.slice(0,-1));
setInput(last);
}

function del(){
setInput(input.slice(0,-1));
}

function clearAll(){
setInput("");
}

function calculate(){
try{
setInput(eval(input).toString());
}catch{
setInput("Error");
}
}

/////////////////////////////////////////////////

function plotGraph(){
const canvas = document.getElementById("graphCanvas");
if(!canvas) return;

const ctx = canvas.getContext("2d");

ctx.clearRect(0,0,246,180);
ctx.beginPath();

for(let x=-10;x<=10;x+=0.1){
let y;

try{
y = eval(input.replace(/x/g,`(${x})`));
}catch{
return;
}

const px = x*12+123;
const py = -y*12+90;

ctx.lineTo(px,py);
}

ctx.strokeStyle="cyan";
ctx.lineWidth=2;
ctx.stroke();
}

/////////////////////////////////////////////////

return(
<div
className="calculator"
onMouseMove={drag}
onMouseUp={stopDrag}
style={{
position:"absolute",
left:pos.x,
top:pos.y,
zIndex:9999
}}
>

<div className="dragbar" onMouseDown={startDrag}>
Scientific Calculator
</div>

<div className="tabs">
<button onClick={()=>setTab("calc")}>Calculator</button>
<button onClick={()=>setTab("algebra")}>Algebra</button>
<button onClick={()=>setTab("matrix")}>Matrix</button>
<button onClick={()=>setTab("graph")}>Graph</button>
</div>

<input
className="screen"
value={input}
onChange={(e)=>setInput(e.target.value)}
/>

{tab==="calc" && (
<div className="calcGrid">
<button onClick={()=>add("7")}>7</button>
<button onClick={()=>add("8")}>8</button>
<button onClick={()=>add("9")}>9</button>
<button onClick={()=>add("/")}>÷</button>
<button onClick={()=>add("4")}>4</button>
<button onClick={()=>add("5")}>5</button>
<button onClick={()=>add("6")}>6</button>
<button onClick={()=>add("*")}>×</button>
<button onClick={()=>add("1")}>1</button>
<button onClick={()=>add("2")}>2</button>
<button onClick={()=>add("3")}>3</button>
<button onClick={()=>add("-")}>−</button>
<button onClick={()=>add("0")}>0</button>
<button onClick={()=>add(".")}>.</button>
<button onClick={calculate}>=</button>
<button onClick={()=>add("+")}>+</button>
<button onClick={()=>add("Math.sqrt(")}>√</button>
<button onClick={()=>add("Math.tan(")}>tan</button>
<button onClick={()=>add("Math.cos(")}>cos</button>
<button onClick={()=>add("Math.sin(")}>sin</button>
</div>
)}

{tab==="algebra" && (
<div className="grid">
<button onClick={()=>add("x")}>x</button>
<button onClick={()=>add("**2")}>x²</button>
<button onClick={()=>add("**3")}>x³</button>
<button onClick={()=>add("+")}>+</button>
<button onClick={()=>add("-")}>−</button>
<button onClick={()=>add("*")}>×</button>
<button onClick={()=>add("/")}>÷</button>
<button onClick={calculate}>Solve</button>
</div>
)}

{tab==="matrix" && (
<div className="matrix-box">
<p>Matrix Calculator</p>
<p style={{fontSize:"11px",opacity:0.7}}>Matrix 3×3</p>

<div className="matrix-grid">
<input value={matrix[0][0]} onChange={(e)=>updateMatrix(0,0,e.target.value)} placeholder="a11"/>
<input value={matrix[0][1]} onChange={(e)=>updateMatrix(0,1,e.target.value)} placeholder="a12"/>
<input value={matrix[0][2]} onChange={(e)=>updateMatrix(0,2,e.target.value)} placeholder="a13"/>
<input value={matrix[1][0]} onChange={(e)=>updateMatrix(1,0,e.target.value)} placeholder="a21"/>
<input value={matrix[1][1]} onChange={(e)=>updateMatrix(1,1,e.target.value)} placeholder="a22"/>
<input value={matrix[1][2]} onChange={(e)=>updateMatrix(1,2,e.target.value)} placeholder="a23"/>
<input value={matrix[2][0]} onChange={(e)=>updateMatrix(2,0,e.target.value)} placeholder="a31"/>
<input value={matrix[2][1]} onChange={(e)=>updateMatrix(2,1,e.target.value)} placeholder="a32"/>
<input value={matrix[2][2]} onChange={(e)=>updateMatrix(2,2,e.target.value)} placeholder="a33"/>
</div>

<div className="matrix-tools">
<button onClick={determinant}>Determinant</button>
<button onClick={loadMatrix}>Load to Screen</button>
</div>
</div>
)}

{tab==="graph" && (
<div>
<div className="grid">
<button onClick={()=>add("x")}>x</button>
<button onClick={()=>add("**2")}>x²</button>
<button onClick={()=>add("+")}>+</button>
<button onClick={plotGraph}>Plot</button>
</div>

<canvas id="graphCanvas" width="246" height="180"></canvas>
</div>
)}

<div className="tools">
<button onClick={undo}>Undo</button>
<button onClick={del}>Delete</button>
<button onClick={clearAll}>Clear</button>
</div>

</div>
);
}