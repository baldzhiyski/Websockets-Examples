import { useEffect, useRef } from 'react'
import useWebSocket from 'react-use-websocket'  // Import WebSocket hook for handling connections
import throttle from 'lodash.throttle'  // Import lodash throttle to limit message sending rate
import { Cursor } from './components/Cursor'  // Import the Cursor component

// Function to render cursors for all connected users
const renderCursors = users => {
    return Object.keys(users)
    .map(uuid => {
        const user = users[uuid]

        return <Cursor key={uuid} userId={uuid} point={[user.state.x, user.state.y]} />
    })
}

// Function to render a list of users and their states
const renderUsersList = users => {
    return (
      <ul>
        {Object.keys(users).map(uuid => {
          return <li key={uuid}>{JSON.stringify(users[uuid])}</li>
        })}
      </ul>
    )
}

// Home component which establishes a WebSocket connection
export function Home({ username }) {

    const WS_URL = 'ws://localhost:8000'  // Define the WebSocket server URL

    // Establish a WebSocket connection with query parameters
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
        queryParams: { username }
    })

    const THROTTLE = 50;  // Define the throttle limit (50ms)

    // Create a throttled function to limit how often cursor positions are sent
    const sendJsonMessageThrottled = useRef(throttle(sendJsonMessage, THROTTLE))

    useEffect(() => {
        // Send the initial cursor position when the component mounts
        sendJsonMessage({
            x: 0,
            y: 0
        })

        // Attach a mousemove event listener to track and send cursor positions
        window.addEventListener('mousemove', e => {
            sendJsonMessageThrottled.current({
                x: e.clientX,
                y: e.clientY
            })
        })

        // Cleanup: remove event listener when component unmounts
        return () => {
            window.removeEventListener('mousemove', e => {
                sendJsonMessageThrottled.current({
                    x: e.clientX,
                    y: e.clientY
                })
            })
        }

    }, []) // Empty dependency array ensures this effect runs only once when mounted

    // If there is a message received from the WebSocket server, render cursors and user list
    if (lastJsonMessage) {
        return <>
            {renderCursors(lastJsonMessage)}
            {renderUsersList(lastJsonMessage)}
        </>
    }

    // If no message has been received yet, just greet the user
    return <h1>Hello, {username}</h1>
}
