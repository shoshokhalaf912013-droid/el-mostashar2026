const express=require("express")
const http=require("http")
const {Server}=require("socket.io")

const app=express()

const server=http.createServer(app)

const io=new Server(server,{
cors:{origin:"*"}
})

let writer=null

io.on("connection",(socket)=>{

console.log("user connected")

socket.on("choose-writer",(id)=>{

writer=id

io.emit("writer-changed",id)

})

socket.on("draw",(data)=>{

socket.broadcast.emit("draw",data)

})

})

server.listen(5000,()=>{

console.log("socket running")

})