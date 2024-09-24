//import RecordingSection from '@/components/RecordingSection'
//import AudioPlayer from '@/components/AudioPlayer'
import MainComponent from '@/components/MainComponent'
import '@/app/styles/globals.css'

export default function Home() {
  return (
    <div className="px-4 md:px-10 lg:px-40 flex flex-col lg:flex-row justify-center py-5 gap-8">
      {/* <RecordingSection /> */}
      <MainComponent/>
      {/* <AudioPlayer /> */}
    </div>
  )
}