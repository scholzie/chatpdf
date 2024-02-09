'use client'
import { Inbox } from 'lucide-react'
import React from 'react'
import {useDropzone} from 'react-dropzone'

type Props = {}

const FileUpload = (props: Props) => {
  const {getRootProps, getInputProps} = useDropzone();
  return (
    <div className='p-2 bg-white rounded-xl'>
      <div {...getRootProps({
        className: 'border-dashed border-2 rounded-xl cursor-pointer bg-gray-60 py-8 flex flex-col justify-center items-center'
      })}>
        <input {...getInputProps()} />
        <>
          <Inbox className='w-10 h-10 text-blue-500' />
          <p className='mt-2 text-sm text-slate-400'>Drop PDF Here!</p>
        </>
      </div>
    </div>
  )
}

export default FileUpload