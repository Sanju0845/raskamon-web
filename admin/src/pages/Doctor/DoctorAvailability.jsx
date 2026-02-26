import { DoctorContext } from '@/context/DoctorContext'
import { Check, Clock, X, Calendar, Save } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const TIME_OPTIONS = []

for (let h = 0; h <= 23; h++) {
    for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, '0')
        const minute = m.toString().padStart(2, '0')
        TIME_OPTIONS.push(`${hour}:${minute}`)
    }
}


const defaultAvailability = DAYS.map(day => ({
    day,
    isAvailable: true,
    startTime: '00:00',
    endTime: '23:30',
    breaks: []
}))

const DoctorAvailability = () => {
    const { dToken, profileData, getProfileData, backendUrl } = useContext(DoctorContext)

    const [availability, setAvailability] = useState(defaultAvailability)
    const [loading, setLoading] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [originalAvailability, setOriginalAvailability] = useState(null)

    useEffect(() => {
        if (dToken) {
            getProfileData()
        }
    }, [dToken])

    useEffect(() => {
        if (profileData) {
            if (profileData.availability && profileData.availability.length > 0) {

                const mergedAvailability = DAYS.map(day => {
                    const existing = profileData.availability.find(a => a.day === day)
                    return existing || defaultAvailability.find(d => d.day === day)
                })
                setAvailability(mergedAvailability)
                setOriginalAvailability(JSON.stringify(mergedAvailability))
            } else {

                setAvailability(defaultAvailability)
                setOriginalAvailability(JSON.stringify(defaultAvailability))
            }
        }
    }, [profileData])

    useEffect(() => {
        if (originalAvailability !== null) {
            const currentStr = JSON.stringify(availability)
            setHasChanges(currentStr !== originalAvailability)
        }
    }, [availability, originalAvailability])

    const toggleDayAvailability = (dayIndex) => {
        const updated = [...availability]
        updated[dayIndex] = {
            ...updated[dayIndex],
            isAvailable: !updated[dayIndex].isAvailable
        }
        setAvailability(updated)
    }

    const updateTime = (dayIndex, field, value) => {
        const updated = [...availability]
        updated[dayIndex] = {
            ...updated[dayIndex],
            [field]: value
        }
        setAvailability(updated)
    }

    const saveAvailability = async () => {
        setLoading(true)
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/update-profile',
                { availability },
                { headers: { dToken } }
            )

            if (data.success) {
                toast.success('Availability updated successfully! 🎉')
                setOriginalAvailability(JSON.stringify(availability))
                setHasChanges(false)
                await getProfileData()
            } else {
                toast.error(data.message || 'Failed to update availability')
            }
        } catch (error) {
            console.error('Save availability error:', error)
            if (error.response) {

                toast.error(error.response.data?.message || 'Server error')
            } else if (error.request) {

                toast.error('No response from server')
            } else {
                toast.error(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    const resetChanges = () => {
        if (originalAvailability) {
            setAvailability(JSON.parse(originalAvailability))
        }
    }

    const formatTimeDisplay = (time) => {
        const [hours, minutes] = time.split(':')
        const h = parseInt(hours)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const displayHour = h % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
    }

    return (
        <div className='m-2 w-full sm:w-[80vw] sm:min-h-[90vh] flex flex-col items-center sm:items-start justify-start pb-6 gap-4 sm:p-4 bg-gray-50 sm:bg-transparent rounded'>
            <div className='flex items-center gap-3'>
                <Calendar className='text-primary' size={28} />
                <h1 className='text-2xl mt-3 sm:mt-0 sm:text-3xl font-semibold px-1 tracking-wide text-primary select-none'>
                    Manage Availability
                </h1>
            </div>

            <p className='text-gray-600 text-sm sm:text-base mb-4'>
                Set your available hours for each day of the week. Patients will only be able to book appointments during your available times.
            </p>

            <div className='w-full bg-white rounded-xl shadow-lg p-4 sm:p-6 motion-translate-x-in-[0%] motion-translate-y-in-[-10%] motion-duration-[0.38s] motion-ease-spring-bouncier'>
                <div className='space-y-4'>
                    {availability.map((dayData, index) => (
                        <div
                            key={dayData.day}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${dayData.isAvailable
                                ? 'border-primary/30 bg-primary/5'
                                : 'border-gray-200 bg-gray-50'
                                }`}
                        >
                            <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                                {/* Day Toggle */}
                                <div className='flex items-center gap-3 min-w-[180px]'>
                                    <button
                                        onClick={() => toggleDayAvailability(index)}
                                        className={`w-12 h-6 rounded-full relative transition-all duration-200 ${dayData.isAvailable ? 'bg-primary' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${dayData.isAvailable ? 'left-6' : 'left-0.5'
                                                }`}
                                        />
                                    </button>
                                    <span className={`font-semibold ${dayData.isAvailable ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {dayData.day}
                                    </span>
                                </div>

                                {/* Time Selection */}
                                {dayData.isAvailable ? (
                                    <div className='flex flex-wrap items-center gap-3 flex-1'>
                                        <div className='flex items-center gap-2'>
                                            <Clock size={16} className='text-gray-500' />
                                            <span className='text-sm text-gray-600'>From</span>
                                            <select
                                                value={dayData.startTime}
                                                onChange={(e) => updateTime(index, 'startTime', e.target.value)}
                                                className='px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm'
                                            >
                                                {TIME_OPTIONS.map(time => (
                                                    <option key={time} value={time}>
                                                        {formatTimeDisplay(time)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className='flex items-center gap-2'>
                                            <span className='text-sm text-gray-600'>To</span>
                                            <select
                                                value={dayData.endTime}
                                                onChange={(e) => updateTime(index, 'endTime', e.target.value)}
                                                className='px-3 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm'
                                            >
                                                {TIME_OPTIONS.map(time => (
                                                    <option key={time} value={time}>
                                                        {formatTimeDisplay(time)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <span className='text-sm text-primary font-medium ml-auto'>
                                            {(() => {
                                                const [startH, startM] = dayData.startTime.split(':').map(Number)
                                                const [endH, endM] = dayData.endTime.split(':').map(Number)
                                                const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM)
                                                const hours = Math.floor(totalMinutes / 60)
                                                const mins = totalMinutes % 60
                                                return totalMinutes > 0
                                                    ? `${hours}h ${mins > 0 ? mins + 'm' : ''} available`
                                                    : 'Invalid time range'
                                            })()}
                                        </span>
                                    </div>
                                ) : (
                                    <span className='text-gray-400 text-sm italic'>Not available</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col sm:flex-row items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200'>
                    {hasChanges && (
                        <button
                            onClick={resetChanges}
                            disabled={loading}
                            className='flex items-center gap-2 px-5 py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-all duration-200 font-medium'
                        >
                            <X size={18} />
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={saveAvailability}
                        disabled={!hasChanges || loading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${hasChanges && !loading
                            ? 'bg-primary text-white hover:opacity-90'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Availability
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Info Card */}
            <div className='w-full bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4'>
                <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0'>
                        <Clock className='text-white' size={16} />
                    </div>
                    <div>
                        <h3 className='font-semibold text-blue-800 mb-1'>Appointment Slots</h3>
                        <p className='text-blue-700 text-sm'>
                            Appointments are scheduled in 30-minute intervals during your available hours.
                            Patients will see available slots based on your schedule and existing bookings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DoctorAvailability
