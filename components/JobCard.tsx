import React from 'react';
import { Internship } from '../types';
import { Badge } from './Badge';
import { Button } from './Button';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';

interface JobCardProps {
  job: Internship;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const isDeadlineSoon = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const today = new Date();
    const diffTime = Math.abs(deadline.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <div className="group flex flex-col h-full bg-white border-2 border-black rounded-xl p-5 shadow-neo transition-all duration-300 hover:-translate-y-2 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-display font-bold text-gray-900 leading-tight mb-1 group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <p className="font-bold text-gray-500">{job.company}</p>
        </div>
        <div className="shrink-0">
             {/* Random bright color block for logo placeholder */}
             <div className={`w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center font-bold text-white
              ${['bg-pink-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'][job.title.length % 4]}`}>
               {job.company.charAt(0)}
             </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="neutral">{job.type}</Badge>
        <Badge variant="accent">{job.category}</Badge>
        {isDeadlineSoon(job.deadline) && (
          <Badge variant="warning">Urgent</Badge>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-6 flex-grow">
        <p className="line-clamp-2">{job.summary}</p>
        <div className="flex items-center gap-2 pt-2 text-xs font-semibold">
           <MapPin size={14} />
           <span>{job.location}</span>
           <span className="text-gray-300">|</span>
           <Calendar size={14} />
           <span>Deadline: {job.deadline}</span>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t-2 border-gray-100 flex gap-3">
        <Link to={`/internship/${job.id}`} className="flex-1">
          <Button variant="outline" size="sm" fullWidth className="group-hover:bg-black group-hover:text-white group-hover:border-black transition-colors">
            View Details
          </Button>
        </Link>
        <a href={job.telegramApplyLink} target="_blank" rel="noreferrer">
           <Button variant="primary" size="sm" className="px-3">
             <ArrowRight size={18} />
           </Button>
        </a>
      </div>
    </div>
  );
};