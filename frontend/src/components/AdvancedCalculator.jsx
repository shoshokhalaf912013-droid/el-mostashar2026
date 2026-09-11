import { useState, useRef } from "react";

export default function AdvancedCalculator() {

const [screen,setScreen]=useState("");
const calcRef=useRef(null);

function add(v){
setScreen(prev=>prev+v)
}

function calculate(){
try{
setScreen(prev=>eval(prev).toString())
}catch{
setScreen("Error")
}
}

function clearScreen(){
setScreen("")
}

function del(){
setScreen(prev=>prev.slice(0,-1))
}

return(

<div
ref={calcRef}
style={{
position:"absolute",
top:"120px",
left:"200px",
width:"420px",
background:"#0f172a",
borderRadius:"10px",
boxShadow:"0 0 25px gold",
color:"white",
zIndex:9999
}}
>

<div style={{
padding:"10px",
background:"#111827",
cursor:"move",
display:"flex",
justifyContent:"space-between"
}}>

<span>Advanced Calculator</span>

</div>

<input
value={screen}
readOnly
style={{
width:"95%",
margin:"10px",
height:"45px",
fontSize:"20px",
textAlign:"right"
}}
/>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(4,1fr)",
gap:"6px",
padding:"10px"
}}
>

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

<button onClick={del}>Delete</button>
<button onClick={clearScreen}>Clear</button>

</div>

</div>

)

}