import React, { useRef, useState, useEffect } from 'react'
import { PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import { Recording } from '@/app/types/Recording';

interface AudioPlayerProps {
    recordings: (Blob | null)[];
    uploadedAudios: (File | null)[];
    currentSlot: number;
    nextSlot: () => void;
    prevSlot: () => void;
    clearRecording: (slot: number) => void;
    selectedServerRecording: Recording | null;
    recordingNames: string[];
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
    recordings, uploadedAudios, currentSlot, nextSlot, prevSlot, clearRecording, selectedServerRecording, 
    recordingNames,
}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLooping, setIsLooping] = useState(false);
    const [fileName, setFileName] = useState<string>('');

    useEffect(() => {
        const currentAudio = recordings[currentSlot] || uploadedAudios[currentSlot] || selectedServerRecording;
        console.log("currentAudio", currentAudio);

        if (currentAudio instanceof File || currentAudio instanceof Blob) {
            const url = URL.createObjectURL(currentAudio);
            setAudioUrl(url);
            setFileName(`Recording ${currentSlot + 1}`);
        } else if (selectedServerRecording) {
            if (selectedServerRecording.audioData) {
                // Convert base64 to Blob
                const byteCharacters = atob(selectedServerRecording.audioData);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'audio/mpeg' });
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
            } else {
                // Fallback to the MP3 URL if audioData is not available
                const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/recordings/download/${selectedServerRecording.filename}.mp3`;
                setAudioUrl(url);
            }
        } else {
            setAudioUrl(null);
            setFileName('');
        }

        // Reset playback state
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        if (audioRef.current) {
            audioRef.current.load();
        }

        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [currentSlot, recordings, uploadedAudios, selectedServerRecording,audioUrl]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const updateTime = () => {
                setCurrentTime(audio.currentTime);
            };

            audio.addEventListener('timeupdate', updateTime);
            audio.addEventListener('loadedmetadata', () => {
                setDuration(audio.duration);
            });
            audio.addEventListener('ended', () => {
                if (isLooping) {
                    audio.currentTime = 0;
                    audio.play();
                } else {
                    setIsPlaying(false);
                }
            });

            return () => {
                audio.removeEventListener('timeupdate', updateTime);
                audio.removeEventListener('loadedmetadata', () => {});
                audio.removeEventListener('ended', () => {});
            };
        }
    }, [audioUrl, isLooping]);

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
    
                
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleLoop = () => {
        setIsLooping(!isLooping);
        if (audioRef.current) {
            audioRef.current.loop = !isLooping;
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time) || time === 0) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        setCurrentTime(time);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    };

    const currentAudio = selectedServerRecording || uploadedAudios[currentSlot] || recordings[currentSlot];

    const handleSave = () => {
        //onSave();
        setFileName('');
    };

    const getDisplayName = () => {
        if (selectedServerRecording) {
            return selectedServerRecording.filename || fileName;
        }
        const currentName = recordingNames[currentSlot];
        return currentName ? `Slot ${currentSlot + 1} - ${currentName}` : `Slot ${currentSlot + 1}`;
    };

    return (
        <div className="bg-[#2C2121] p-6 rounded-2xl shadow-lg">
            <div className="overflow-hidden">
                <div 
                    className="flex transition-transform duration-300 ease-in-out" 
                    style={{ transform: `translateX(-${currentSlot * 100}%)`, width: '400%' }}
                >
                    {[0, 1, 2, 3].map((slot) => (
                        <div key={slot} className="w-full flex-shrink-0 px-4">
                            <div className="flex items-center mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#FF8686] to-[#FF4545] rounded-lg mr-4"></div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">
                                        {audioUrl ? getDisplayName() : 'No audio'}
                                    </h3>
                                    <p className="text-[#8A7575]">
                                        {selectedServerRecording ? 'Server Recording' : `Slot ${slot + 1}`}
                                    </p>
                                </div>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={duration}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full"
                                
                              
                                disabled={!currentAudio}
                            />
                            <div className="flex justify-between text-[#8A7575] text-sm mt-1">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                            {(recordings[slot] || uploadedAudios[slot]) && (
                                <button
                                    className="w-full py-2 mt-4 rounded-full text-white text-lg font-semibold bg-[#3D2E2E] hover:bg-[#4D3E3E]"
                                    onClick={() => clearRecording(slot)}
                                >
                                    Clear Recording
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-center mt-4 space-x-4">
                <button
                    onClick={togglePlayPause}
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${currentAudio ? 'bg-[#FF4545]' : 'bg-gray-500 cursor-not-allowed'}`}
                    disabled={!currentAudio}
                >
                    {isPlaying ? (
                        <PauseIcon className="w-8 h-8 text-white" />
                    ) : (
                        <PlayIcon className="w-8 h-8 text-white" />
                    )}
                </button>
                <button
                    onClick={toggleLoop}
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${isLooping ? 'bg-[#FF4545]' : 'bg-[#3D2E2E]'}`}
                    disabled={!currentAudio}
                >
                    <ArrowPathIcon className="w-8 h-8 text-white" />
                </button>
            </div>
            <div className="flex justify-between mt-4">
                <button 
                    onClick={prevSlot}
                    className="px-4 py-2 bg-[#3D2E2E] text-white rounded-lg"
                >
                    Previous
                </button>
                <span className="text-white">Slot {currentSlot + 1} / 4</span>
                <button 
                    onClick={nextSlot}
                    className="px-4 py-2 bg-[#3D2E2E] text-white rounded-lg"
                >
                    Next
                </button>
                <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#3D2E2E] text-white rounded-lg"
                >
                    Save
                </button>
            </div>
            {audioUrl && (
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    loop={isLooping}
                />
            )}
        </div>
    )
}

export default AudioPlayer