export function UsersToTalk({ img, first, last, message, id }){
	return (
		<Link className="link" to={`/messages/${id}`}>
			<div className="single-message-cont">
				<div>
					<img className="chat-image" src={img} />
				</div>
				<div className="single-message-info">
					<h3>{first} {last}</h3>
					<p>{message}</p>
				</div>
			</div>
		</Link>
	)
}