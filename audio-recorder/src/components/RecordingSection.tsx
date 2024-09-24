"use client"
import React, { useRef, useState, useEffect } from 'react'
import { MicrophoneIcon, StopIcon,  ArrowUpTrayIcon } from '@heroicons/react/24/solid'
//import { Socket } from 'socket.io-client'

interface AudioRecorderProps {
    recordings: (Blob | null)[];
    setRecordings: React.Dispatch<React.SetStateAction<(Blob | null)[]>>;
    uploadedAudios: (File | null)[];
     setUploadedAudios: React.Dispatch<React.SetStateAction<(File | null)[]>>;
    // socket: Socket;
    activeRecordings: boolean[];
    currentSlot: number;
    nextSlot: () => void;
    prevSlot: () => void;
    clearRecording: (slot: number) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ recordings, setRecordings, uploadedAudios, setUploadedAudios, currentSlot, nextSlot, prevSlot, clearRecording }) => {
    const [isRecording, setIsRecording] = useState<boolean[]>([false, false, false, false]);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [recordingDurations, setRecordingDurations] = useState<number[]>([0, 0, 0, 0]);
    const startTimeRef = useRef<number>(0);
    //const [isPlaying, setIsPlaying] = useState<boolean[]>([false, false, false, false]);
    //const audioRefs = useRef<(HTMLAudioElement | null)[]>([null, null, null, null]);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [recordingName, setRecordingName] = useState<string>('Untitled recording');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording[currentSlot]) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording, currentSlot]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const saveRecording = async (blob: Blob, duration: number, slot: number) => {
        const formData = new FormData();
        formData.append('audio', blob, `${recordingName}-${slot}.ogg`);
        formData.append('duration', duration.toString());
        formData.append('name', recordingName);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/recordings`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to save recording');
            }

            const savedRecording = await response.json();
            console.log('Recording saved:', savedRecording);
        } catch (error) {
            console.error('Error saving recording:', error);
        }
    };

    const startRecording = async (slot: number) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
                setRecordings((prev) => {
                    const newRecordings = [...prev];
                    newRecordings[slot] = blob;
                    return newRecordings;
                });
                const duration = Date.now() - startTimeRef.current;
                setRecordingDurations((prev) => {
                    const newDurations = [...prev];
                    newDurations[slot] = duration;
                    return newDurations;
                });
                saveRecording(blob, duration, slot);
                //socket.emit('stopRecording', { slot });
            };
            mediaRecorder.start();
            startTimeRef.current = Date.now();
            setIsRecording((prev) => {
                const newIsRecording = [...prev];
                newIsRecording[slot] = true;
                return newIsRecording;
            });
           // socket.emit('startRecording', { slot });
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = (slot: number) => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording((prev) => {
                const newIsRecording = [...prev];
                newIsRecording[slot] = false;
                return newIsRecording;
            });
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, slot: number) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedAudios((prev) => {
                const newUploadedAudios = [...prev];
                newUploadedAudios[slot] = file;
                return newUploadedAudios;
            });
            setRecordings((prev) => {
                const newRecordings = [...prev];
                newRecordings[slot] = null;
                return newRecordings;
            });
        }
    };

    return (
        <div className="bg-[#1E1717] p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold mb-8 text-white">Record a sound</h2>
            <div className="overflow-hidden">
                <div 
                    className="flex transition-transform duration-300 ease-in-out" 
                    style={{ transform: `translateX(-${currentSlot * 100}%)`, width: '400%' }}
                >
                    {[0, 1, 2, 3].map((slot) => (
                        <div key={slot} className="w-full flex-shrink-0 px-4">
                            <div className="space-y-6">
                                <div className="bg-[#2C2121] p-4 rounded-xl">
                                    <input
                                        type="text"
                                        value={recordingName}
                                        onChange={(e) => setRecordingName(e.target.value)}
                                        className="w-full bg-transparent text-white text-xl focus:outline-none"
                                    />
                                    <div className="text-[#8A7575] mt-2">{formatTime(elapsedTime)}</div>
                                    <div className="text-[#8A7575] mt-2">Duration: {formatTime(recordingDurations[slot])}</div>
                                </div>
                                <button
                                    className={`w-[27rem] py-4 rounded-full text-white text-xl font-semibold flex items-center justify-center ${
                                        isRecording[slot] ? 'bg-[#FF4545]' : 'bg-[#FF0000] hover:bg-[#FF4545]'
                                    }`}
                                    onClick={() => isRecording[slot] ? stopRecording(slot) : startRecording(slot)}
                                >
                                    {isRecording[slot] ? (
                                        <>
                                            <StopIcon className="w-6 h-6 mr-2" />
                                            Stop
                                        </>
                                    ) : (
                                        <>
                                            <MicrophoneIcon className="w-6 h-6 mr-2" />
                                            Record
                                        </>
                                    )}
                                </button>
                                {(recordings[slot] || uploadedAudios[slot]) && (
                                    <button
                                        className="w-[27rem] py-2 rounded-full text-white text-lg font-semibold bg-[#3D2E2E] hover:bg-[#4D3E3E]"
                                        onClick={() => clearRecording(slot)}
                                    >
                                        Clear Recording
                                    </button>
                                )}
                                <div className="mt-8">
                                    <h3 className="text-2xl font-bold mb-4 text-white">Upload audio files</h3>
                                    <div className="space-y-4">
                                        <div className="bg-[#2C2121] p-4 rounded-xl flex items-center">
                                            <input 
                                                type="file" 
                                                accept="audio/*" 
                                                onChange={(e) => handleFileUpload(e, slot)} 
                                                className="hidden"
                                                id="file-upload"
                                            />
                                            <label htmlFor="file-upload" className="flex items-center cursor-pointer">
                                                <div className="w-8 h-8 bg-[#3D2E2E] rounded-lg flex items-center justify-center mr-4">
                                                    <ArrowUpTrayIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-white font-semibold">Select file</div>
                                                    <div className="text-[#8A7575] text-sm">MP3, WAV, OGG, FLAC, M4A, AIFF, WMA</div>
                                                </div>
                                            </label>
                                        </div>
                                        <div className="bg-[#2C2121] p-4 rounded-xl flex items-center">
                                            <div className="w-8 h-8 bg-[#3D2E2E] rounded-lg flex items-center justify-center mr-4">
                                                <ArrowUpTrayIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-white font-semibold">Drag and drop</div>
                                                <div className="text-[#8A7575] text-sm">Drop files here</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-between mt-4">
                <button 
                    onClick={prevSlot}
                    className="px-4 py-2 bg-[#2C2121] text-white rounded-lg"
                >
                    Previous
                </button>
                <span className="text-white">Slot {currentSlot + 1} / 4</span>
                <button 
                    onClick={nextSlot}
                    className="px-4 py-2 bg-[#2C2121] text-white rounded-lg"
                >
                    Next
                </button>
            </div>
        </div>
    )
}

export default AudioRecorder