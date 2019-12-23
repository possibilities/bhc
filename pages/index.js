import Head from 'next/head'

import Calendar from '../components/calendar'
import sampleEvents from '../events'

function Demo () {
  return (
    <>
      <Head>
        <title>Calendar demo</title>
        <meta name='viewport' content='initial-scale=1.0, width=device-width' />
      </Head>

      <style jsx global>{`
        body {
          margin: 0;
          color: grey;
          font-family: sans-serif;
        }
      `}</style>

      <Calendar events={sampleEvents} />
    </>
  )
}

export default Demo
