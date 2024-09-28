"use client"
import React, { useRef, useState, useEffect } from 'react'
import { PlayIcon, PauseIcon, ForwardIcon, BackwardIcon } from '@heroicons/react/24/solid'
import { Recording } from '../app/types/Recording'

interface AudioPlayerProps {
    recordings: (Blob | null)[];
    uploadedAudios: (File | null)[];
    currentSlot: number;
    nextSlot: () => void;
    prevSlot: () => void;
    clearRecording: (slot: number) => void;
    selectedServerRecording: Recording | null;
    recordingNames: string[];
    recordingDurations: number[];
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
    recordings, 
    uploadedAudios, 
    currentSlot, 
    nextSlot, 
    prevSlot, 
    clearRecording,
    selectedServerRecording,
    recordingNames,
    recordingDurations
}) => {
    
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasAudio, setHasAudio] = useState(false);
useEffect(()=>{
    console.log("from use effect");
    console.log(recordings);
   // const audio=audioRef.current;
   resetAudioPlayer();
   
    
},[recordings])

const resetAudioPlayer = () => {
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasAudio(false);

    let src = '';
    if (recordings[currentSlot]) {
        // Prioritize new recordings
        src = URL.createObjectURL(recordings[currentSlot]);
        console.log("src1",src);
    }

    if (src && audioRef.current) {
        audioRef.current.src = src;
        console.log("src3",src);
        audioRef.current.load();
        audioRef.current.onloadedmetadata = () => {
            console.log("duration",audioRef);
            setDuration(recordingDurations[currentSlot]);
            setIsLoading(false);
            setHasAudio(true);
        };
    } else {
        setIsLoading(false);
    }
};

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setIsLoading(false);
        };
        const handleCanPlay = () => {
            setIsLoading(false);
            setHasAudio(true);
        };
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
        };
    }, []);

    useEffect(() => {
      
        const audio = audioRef.current;
        if (!audio) return;

        setIsLoading(true);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setHasAudio(false);

        let src = '';
        if (selectedServerRecording) {
            //console.log(selectedServerRecording);
            src = `data:audio/ogg;base64,${selectedServerRecording.audioData}`;
            
        } else {
            const currentRecording = recordings[currentSlot];
            const currentUploadedAudio = uploadedAudios[currentSlot];

            if (currentRecording) {
                src = URL.createObjectURL(currentRecording);
            } else if (currentUploadedAudio) {
                src = URL.createObjectURL(currentUploadedAudio);
            }
        }

        if (src) {
            audio.src = src;
            audio.load();
        } else {
            setIsLoading(false);
        }
    }, [currentSlot,  uploadedAudios, selectedServerRecording]);

    const togglePlayPause = () => {
      
        const audio = audioRef.current;
  
        if (!audio || !hasAudio) 
            
            return;
            console.log("src2",audio);
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(error => {
                console.error("Error playing audio:", error);
                setIsPlaying(false);
            });
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = Number(e.target.value);
            setCurrentTime(audio.currentTime);
        }
    };

    return (
        <div className="bg-[#1E1717] p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold mb-8 text-white">Audio Player</h2>
            <div className="space-y-6">
                <div className="bg-[#2C2121] p-4 rounded-xl">
                    <div className="text-white text-xl mb-2">
                        {selectedServerRecording 
                            ? selectedServerRecording.filename 
                            : recordingNames[currentSlot] || `Recording ${currentSlot + 1}`}
                    </div>
                    <div className="text-[#8A7575]">{formatTime(currentTime)} / {formatTime(duration)}</div>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max={duration} 
                    value={currentTime} 
                    onChange={handleSeek}
                    className="w-full"
                />
                <div className="flex justify-center space-x-4">
                    <button onClick={prevSlot} className="p-2 rounded-full bg-[#3D2E2E] text-white">
                        <BackwardIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={togglePlayPause} 
                        className="p-2 rounded-full bg-[#FF0000] text-white"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : isPlaying ? (
                            <PauseIcon className="w-6 h-6" />
                        ) : (
                            <PlayIcon className="w-6 h-6" />
                        )}
                    </button>
                    <button onClick={nextSlot} className="p-2 rounded-full bg-[#3D2E2E] text-white">
                        <ForwardIcon className="w-6 h-6" />
                    </button>
                </div>
                <button
                    className="w-full py-2 rounded-full text-white text-lg font-semibold bg-[#3D2E2E] hover:bg-[#4D3E3E]"
                    onClick={() => clearRecording(currentSlot)}
                >
                    Clear Recording
                </button>
            </div>
            <audio ref={audioRef} />
        </div>
    )
}

export default AudioPlayer