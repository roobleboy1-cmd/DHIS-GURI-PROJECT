import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  ClipboardList,
  Building2,
  ArrowRight,
  AlertCircle,
  PlusCircle,
  Compass,
  FileCheck2,
  CheckCircle2,
} from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import ProjectStatusDonutChart from '../../components/dashboard/ProjectStatusDonutChart';
import ProjectProgressBarChart from '../../components/dashboard/ProjectProgressBarChart';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate } from '../../utils/helpers';

const ClientDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t, isSomali } = useLanguage();

  useEffect(() => {
    api.get('/dashboard/client')
      .then((res) => {
        setData(res.data?.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner message={isSomali ? "Soo dejinaya barta macmiilka..." : "Loading client portal..."} />;

  if (error) {
    return (
      <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-rose-700 dark:text-rose-300 flex items-center gap-3 shadow-xs">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-semibold">
          {isSomali ? `Khalad: ${error}` : `Failed to load your project data: ${error}`}
        </span>
      </div>
    );
  }

  const projectColumns = [
    {
      header: isSomali ? 'Magaca Mashruuca' : 'Project Title',
      key: 'title',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-white text-sm">{row.title}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {isSomali ? 'Injineerka:' : 'Lead:'} {row.engineer_name || (isSomali ? 'Injineer Goobta' : 'Assigned Site Engineer')}
          </p>
        </div>
      ),
    },
    {
      header: isSomali ? 'Xaaladda' : 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: isSomali ? 'Horumarka Dhismaha' : 'Construction Completion',
      key: 'progress_percentage',
      render: (row) => {
        const pct = Math.min(100, Math.max(0, Number(row.progress_percentage) || 0));
        return (
          <div className="w-36 space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span>{pct}%</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {pct >= 100 ? (isSomali ? 'Dhameystiran' : 'Completed') : (isSomali ? 'Wuu Socdaa' : 'On Track')}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200/50 dark:border-slate-700 p-0.5">
              <div
                className="bg-gradient-to-r from-[#123C69] via-orange-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: isSomali ? 'Cusbooneysiintii Ugu Dambeysay' : 'Last Site Update',
      key: 'updated_at',
      render: (row) => <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(row.updated_at)}</span>,
    },
    {
      header: isSomali ? 'Goobta' : 'Workspace',
      key: 'action',
      render: (row) => (
        <Link
          to={`/projects/${row.id}`}
          className="text-xs font-bold text-[#123C69] dark:text-orange-400 hover:text-orange-600 inline-flex items-center gap-1 transition-colors group"
        >
          <span>{isSomali ? 'La Soco Dhismaha' : 'Track Site'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ),
    },
  ];

  const totalProjects = data?.projects?.total || 0;
  const totalRequests = data?.requests?.total || 0;
  const activeMilestones = data?.recent_projects?.length || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Welcome Banner */}
      <WelcomeBanner
        subtitle={
          isSomali
            ? "La soco marxaladaha dhismaha gurigaaga, eeg naqshadaha la ansixiyay, oo la xiriir injineerkaaga shaqada wada."
            : "Monitor your turnkey home construction milestones, review verified engineering drawings, and track ground build progress."
        }
        actions={
          <>
            <Link
              to="/houses"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs transition-colors shadow-xs"
            >
              <Compass className="w-4 h-4 text-orange-300" />
              <span>{isSomali ? 'Eeg Guryaha' : 'Browse Catalog'}</span>
            </Link>
            <Link
              to="/requests"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSomali ? 'Dalbo Guriga Cusub' : 'New Request'}</span>
            </Link>
          </>
        }
      />

      {/* 2. Key Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={isSomali ? "Mashaariicdayda Dhismaha" : "Commissioned Projects"}
          value={totalProjects}
          icon={FolderKanban}
          color="blue"
          subtitle={isSomali ? "Goobaha guriyeyntaada" : "Residential building sites"}
        />
        <StatCard
          title={isSomali ? "Codsiyada Aan Diray" : "Submitted Requests"}
          value={totalRequests}
          icon={ClipboardList}
          color="orange"
          subtitle={isSomali ? "Codsiyada dhismaha guriga" : "Construction inquiries"}
        />
        <StatCard
          title={isSomali ? "Goobaha Shaqadu Ka Socoto" : "Active Build Sites"}
          value={activeMilestones}
          icon={Building2}
          color="purple"
          subtitle={isSomali ? "Goobaha dhismuhu tooska u socdo" : "Sites with ground activity"}
        />
        <StatCard
          title={isSomali ? "Kormeerka Injineerka" : "Supervision Status"}
          value={totalProjects > 0 ? (isSomali ? "Wuu Socdaa" : "Active") : (isSomali ? "Lama Hayo" : "None")}
          icon={CheckCircle2}
          color="green"
          subtitle={isSomali ? "Kormeer joogto ah" : "Engineer inspection active"}
        />
      </div>

      {/* 3. Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col">
          <ProjectStatusDonutChart
            data={data?.projects?.by_status || []}
            title={isSomali ? "Xaaladda Guryahayga" : "My Projects Status"}
            subtitle={isSomali ? "Marxaladaha dhismaha guryahaaga" : "Phases of your residential constructions"}
          />
        </div>
        <div className="lg:col-span-7 flex flex-col">
          <ProjectProgressBarChart
            projects={data?.recent_projects || []}
            title={isSomali ? "Kormeerka Horumarka Guriga" : "Construction Progress Tracker"}
            subtitle={isSomali ? "Heerarka dhameystirka ee guryahaaga" : "Live stage completion of your properties"}
          />
        </div>
      </div>

      {/* 4. Projects Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-4.5 h-4.5 text-[#123C69] dark:text-orange-400" />
              {isSomali ? 'Guryahayga Dhismaha ku Jira' : 'My Construction Sites'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {isSomali ? 'La socodka tooska ah ee dhismaha gurigaaga' : 'Direct oversight of your commissioned residential builds'}
            </p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-bold text-[#123C69] dark:text-orange-400 hover:text-orange-600 transition-colors inline-flex items-center gap-1"
          >
            {isSomali ? 'Dhammaan Guryaha' : 'All Projects'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          <DataTable
            columns={projectColumns}
            data={data?.recent_projects || []}
            emptyMessage={isSomali ? "Weli ma aadan dalban wax dhisme guri ah." : "You have not commissioned any construction projects yet."}
          />
        </div>
      </div>

      {/* 5. Quick Action Prompt when no active projects */}
      {(!data?.recent_projects || data.recent_projects.length === 0) && (
        <div className="bg-gradient-to-r from-blue-50/80 to-orange-50/80 dark:from-slate-900 dark:to-slate-850 rounded-2xl border border-blue-100 dark:border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-[#123C69] dark:text-white">
              {isSomali ? 'Ma diyaar u tahay inaad dhisato gurigaaga riyada?' : 'Ready to start building your dream home?'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              {isSomali
                ? 'Baadh naqshadaha casriga ah ee guryaha Soomaaliya ama gudbi codsi cusub si aad ula shaqayso injineerro shahaado haysta.'
                : 'Explore our verified turnkey architectural house catalog or submit a custom construction inquiry to be paired with a certified Somali engineer.'}
            </p>
          </div>
          <Link
            to="/houses"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shrink-0 shadow-md shadow-orange-500/20"
          >
            {isSomali ? 'Baadh Naqshadaha Guryaha' : 'Explore House Designs'}
          </Link>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
