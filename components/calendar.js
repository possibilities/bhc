import { useState, memo } from 'react'
import dateFormat from 'dateformat'

// Utils

function range (num) {
  const arr = []
  let index = 0
  while (index < num) { arr.push(index++) }
  return arr
}

// Borrowed from https://stackoverflow.com/a/4156516/100304
// Used to force Monday as first day
function startOfWeekForDate (date) {
  const day = date.getDay()
  const startOfWeekDay = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.getFullYear(), date.getMonth(), startOfWeekDay)
}

// Calculate some useful values up front
const oneHourMs = 1000 * 60 * 60
const oneDayMs = oneHourMs * 24
const oneDayPercentOfWeek = 100 / 7
const oneMsPercentOfDay = 100 / oneDayMs

const days = range(7)
const hours = range(24)

function incrementDateByDays (date, numberOfDays) {
  return new Date(date.getTime() + oneDayMs * numberOfDays)
}

// Calculate left/right/top/bottom percentages for event so it can
// be absolutely positioned on the week grid
function getStylesForEvent (startOfWeekMs, event) {
  // Get dates and timestamps
  const eventStartedAt = new Date(event.started_at)
  const eventStartMs = eventStartedAt.getTime()
  const eventEndAt = new Date(event.ended_at)
  const eventEndMs = eventEndAt.getTime()
  const startOfDay = new Date(
    eventStartedAt.getFullYear(),
    eventStartedAt.getMonth(),
    eventStartedAt.getDate()
  )
  const startOfDayMs = startOfDay.getTime()

  // Figure out left/right position percentages
  const dayPos = Math.floor((eventStartMs - startOfWeekMs) / oneDayMs)
  const nextDayPos = dayPos + 1
  const nextDayPercent = nextDayPos * oneDayPercentOfWeek
  const left = `${dayPos * oneDayPercentOfWeek}%`
  const right = `calc(${100 - nextDayPercent}% + 10px)`

  // Figure out top/bottom position percentages
  const startRelativeMs = eventStartMs - startOfDayMs
  const endRelativeMs = eventEndMs - startOfDayMs
  const top = `${(startRelativeMs / oneDayMs) * 100}%`
  const bottom = `${100 - (endRelativeMs * oneMsPercentOfDay)}%`

  return { left, right, top, bottom }
}

// Check if an event happens during a given week for the purpose
// of filtering
function isEventContainedInWeek (startOfWeekMs) {
  return function (event) {
    const eventStartMs = new Date(event.started_at).getTime()
    const eventEndMs = new Date(event.ended_at).getTime()

    return (
      // Event happens after week start
      eventEndMs >= startOfWeekMs &&
      // Event happens before week start
      (startOfWeekMs + (oneDayMs * 7)) >= eventStartMs)
  }
}

const Grid = memo(function Grid () {
  return (
    <>
      <style jsx>{`
        .grid {
          display: flex;
          flex-grow: 1;
          position: relative;
          border-left: 1px solid #ccc;
          border-top: 1px solid #ccc;
        }
        .column {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        .cell {
          flex-grow: 1;
          flex-basis: 0;
          border-bottom: 1px solid #ccc;
          border-right: 1px solid #ccc;
        }
      `}</style>
      <div className='grid'>
        {days.map(function (day, index) {
          return (
            <div key={index} className='column'>
              {hours.map(function (hour) {
                return <div key={hour} className='cell' />
              })}
            </div>
          )
        })}
      </div>
    </>
  )
})

function Events ({ date, events }) {
  const startOfWeek = startOfWeekForDate(date)
  const startOfWeekMs = startOfWeek.getTime()
  const eventsForWeek = events.filter(isEventContainedInWeek(startOfWeekMs))
  return (
    <>
      <style jsx>{`
        .event {
          background: #ccc;
          overflow: hidden;
          border: 1px solid #707070;
          font-size: 12px;
          padding: 7px;
          position: absolute;
        }
        .event > p {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0 0 5px 0;
        }
      `}</style>
      {eventsForWeek.map(event => {
        return (
          <div
            key={event.id}
            className='event'
            style={getStylesForEvent(startOfWeekMs, event)}
          >
            <p>{event.name}</p>
            <p>
              {dateFormat(new Date(event.started_at), 'h:MM TT')}
              {' '}-{' '}
              {dateFormat(new Date(event.ended_at), 'h:MM TT')}
            </p>
          </div>
        )
      })}
    </>
  )
}

function Calendar ({ events }) {
  const [date, setDate] = useState(new Date())
  const toNextWeek = () => setDate(date => incrementDateByDays(date, 7))
  const toPrevWeek = () => setDate(date => incrementDateByDays(date, -7))
  return (
    <>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          /* Fill container, must be position: relative */
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
        }
        .calendar {
          display: flex;
          position: relative;
          flex-direction: column;
          flex-grow: 1;
        }
        .controls {
          text-align: right;
          padding: 10px;
        }
        .controls > button {
          margin-left: 10px;
        }
      `}</style>
      <div className='container'>
        <div className='calendar'>
          <Grid />
          <Events date={date} events={events} />
        </div>
        <div className='controls'>
          <button onClick={toPrevWeek}>prev</button>
          <button onClick={toNextWeek}>next</button>
        </div>
      </div>
    </>
  )
}

export default Calendar
