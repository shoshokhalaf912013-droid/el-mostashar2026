export default function BoardSidebar({saveBoard}){

return(

<div className="board-sidebar">

<button onClick={saveBoard}>
💾 Save Board
</button>

</div>

)

}