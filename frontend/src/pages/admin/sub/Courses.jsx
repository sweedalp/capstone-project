import { useState } from 'react'
import { useApp } from '../../../context/AdminContext.jsx'
import { MOCK_COURSES, AVATAR } from '../../../data/adminMockData.js'
import Icon  from '../../../components/ui/Icon.jsx'
import Badge from '../../../components/ui/Badge.jsx'

export default function Courses() {
  const { showToast } = useApp()
  const [courses] = useState(MOCK_COURSES)
  const active = courses.filter(c=>c.status==='active').length
  const total  = courses.reduce((a,c)=>a+c.learners,0)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Courses</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{active} active courses · {total} total learners</p>
        </div>
        <button onClick={()=>showToast('Course wizard opened!','info')} className="btn-primary">
          <Icon name="add_circle" className="text-lg" />Create Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map(c=>(
          <div key={c.id} className="card p-6 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Icon name="school" className="text-2xl text-primary" />
              </div>
              <Badge color={c.status==='active'?'green':'slate'}>{c.status}</Badge>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{c.title}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
              <img src={AVATAR} className="w-4 h-4 rounded-full" alt="" />
              {c.instructor} · {c.duration} · {c.category}
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500 font-semibold">Completion</span>
                <span className="font-bold text-slate-900 dark:text-white">{c.completion}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                <div className="h-2 bg-primary rounded-full" style={{width:`${c.completion}%`}} />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Icon name="group" className="text-base text-slate-400" />{c.learners} learners
              </span>
              <button onClick={()=>showToast('Course details opened','info')} className="text-xs text-primary font-semibold hover:underline">Manage →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}