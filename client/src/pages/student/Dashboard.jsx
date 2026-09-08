import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  ArrowRight,
  User,
  Edit3,
  Target,
  Code2,
  FolderGit2,
  Binary,
  FileCheck,
  Briefcase,
  Lightbulb,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [skills, setSkills] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [assignedTests, setAssignedTests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [dsaEntries, setDsaEntries] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          profileRes,
          readinessRes,
          skillsRes,
          jobsRes,
          recsRes,
          testsRes,
          projectsRes,
          dsaRes,
        ] = await Promise.allSettled([
          API.get('/profile'),
          API.get('/readiness'),
          API.get('/student-skills'),
          API.get('/jobs/matches'),
          API.get('/recommendations'),
          API.get('/assessments/my-assignments'),
          API.get('/projects'),
          API.get('/dsa'),
        ]);

        if (profileRes.status === 'fulfilled') setProfileData(profileRes.value.data);
        if (readinessRes.status === 'fulfilled') setReadiness(readinessRes.value.data);
        if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value.data);
        if (jobsRes.status === 'fulfilled') setJobMatches(jobsRes.value.data);
        if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value.data.recommendations || []);
        if (testsRes.status === 'fulfilled') setAssignedTests(testsRes.value.data || []);
        if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value.data || []);
        if (dsaRes.status === 'fulfilled') setDsaEntries(dsaRes.value.data || []);
      } catch (error) {
        console.error('Error loading student dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  const topRecommendation = recommendations.length > 0 ? recommendations[0] : null;

  // Calculate DSA stats
  const totalDsaProblems = dsaEntries.reduce((acc, curr) => acc + (curr.totalProblems || 0), 0);
  const totalDsaSolved = dsaEntries.reduce((acc, curr) => acc + (curr.solvedProblems || 0), 0);
  const dsaPercentage = totalDsaProblems > 0 ? Math.round((totalDsaSolved / totalDsaProblems) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.name}</h1>
          <p className="page-subtitle">Track your placement readiness, technical skills, assessments, and job matches in real time.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/student/profile" className="btn btn-secondary">
            <Edit3 size={16} /> Edit Profile
          </Link>
          <Link to="/student/skills" className="btn btn-primary">
            + Manage Skills
          </Link>
        </div>
      </div>

      {/* Profile Completion Status Banner */}
      <div className="card" style={{ marginBottom: '20px', backgroundColor: '#0f172a', borderLeft: '4px solid var(--success)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={26} color="var(--success)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Profile Completed</h3>
                <span className="user-badge" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>100% Active</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                {profileData?.college ? `${profileData.college} • ${profileData.department || ''} (${profileData.graduationYear || ''})` : 'Student Academic Profile Verified'}
              </p>
            </div>
          </div>

          <Link to="/student/profile" className="btn btn-secondary btn-sm">
            <Edit3 size={14} /> Edit Profile Details
          </Link>
        </div>
      </div>

      {/* Placement Readiness Score Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Placement Readiness Score
            </h3>
            {readiness && readiness.hasData ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '8px' }}>
                <span style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                  {readiness.readinessScore}%
                </span>
                <span className="user-badge" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
                  {readiness.status}
                </span>
              </div>
            ) : (
              <div style={{ marginTop: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--warning)', fontWeight: 600 }}>
                  Not available yet
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px', maxWidth: '480px' }}>
                  Complete your skills, assessments, projects and DSA tracking to calculate your readiness score.
                </p>
              </div>
            )}
          </div>

          {readiness && readiness.hasData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', minWidth: '320px' }}>
              <div style={{ textAlign: 'center', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Skills (40%)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{readiness.breakdown.technicalSkills}%</div>
              </div>
              <div style={{ textAlign: 'center', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assess (30%)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{readiness.breakdown.assessments}%</div>
              </div>
              <div style={{ textAlign: 'center', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projects (20%)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{readiness.breakdown.projects}%</div>
              </div>
              <div style={{ textAlign: 'center', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DSA (10%)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{readiness.breakdown.dsa}%</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid Row 1: Technical Skills & Skill Assessments */}
      <div className="grid-2" style={{ marginBottom: '20px' }}>
        {/* My Technical Skills */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={18} color="var(--primary-color)" /> My Skills
            </h3>
            <Link to="/student/skills" style={{ fontSize: '0.85rem' }}>View All</Link>
          </div>

          {skills.length === 0 ? (
            <EmptyState
              title="No skills added yet"
              message="Add technical skills to track your proficiency and calculate readiness."
              actionLabel="+ Add Your First Skill"
              onAction={() => window.location.href = '/student/skills'}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {skills.slice(0, 4).map((sk) => (
                <div key={sk._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 600 }}>{sk.skillId?.name || 'Skill'}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{sk.progress}% ({sk.currentLevel})</span>
                  </div>
                  <ProgressBar progress={sk.progress} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Skill Assessments */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={18} color="var(--warning)" /> Assessment Results
            </h3>
            <Link to="/student/assessments" style={{ fontSize: '0.85rem' }}>View All Assessments</Link>
          </div>

          {assignedTests.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '12px 0' }}>
              No assessments currently assigned to you.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {assignedTests.slice(0, 3).map((item) => {
                const test = item.testId || {};
                const isCompleted = item.status === 'completed';
                const isInProgress = item.status === 'in-progress';

                return (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      backgroundColor: '#0f172a',
                      borderRadius: '6px',
                      borderLeft: isCompleted
                        ? '4px solid var(--success)'
                        : isInProgress
                        ? '4px solid var(--warning)'
                        : '4px solid var(--primary-color)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{test.title || 'Assessment'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Skill: {test.skillId?.name || 'General'} • {test.duration} mins
                      </div>
                    </div>

                    <div>
                      {isCompleted ? (
                        <span className="user-badge" style={{ backgroundColor: '#10b981', color: '#ffffff' }}>
                          <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Score: {item.score}%
                        </span>
                      ) : (
                        <Link to={`/student/assessments/${test._id}`} className="btn btn-primary btn-sm">
                          {isInProgress ? 'Resume' : 'Start'} <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Grid Row 2: Projects & DSA Progress */}
      <div className="grid-2" style={{ marginBottom: '20px' }}>
        {/* Projects Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderGit2 size={18} color="#a855f7" /> Projects Overview
            </h3>
            <Link to="/student/projects" style={{ fontSize: '0.85rem' }}>Manage Projects</Link>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              title="No projects added yet"
              message="Add technical projects to demonstrate hands-on experience to recruiters."
              actionLabel="+ Add First Project"
              onAction={() => window.location.href = '/student/projects'}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {projects.slice(0, 3).map((p) => (
                <div key={p._id} style={{ padding: '12px 14px', backgroundColor: '#0f172a', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {p.techStack ? p.techStack.join(', ') : 'Software Project'}
                    </div>
                  </div>
                  <span className="user-badge" style={{ backgroundColor: p.status === 'Completed' ? '#10b981' : '#3b82f6', color: '#ffffff' }}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DSA Progress */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Binary size={18} color="#3b82f6" /> DSA Problem Solving
            </h3>
            <Link to="/student/dsa" style={{ fontSize: '0.85rem' }}>DSA Tracker</Link>
          </div>

          {dsaEntries.length === 0 ? (
            <EmptyState
              title="No DSA topics tracked yet"
              message="Track Data Structures & Algorithms topic solving counts to boost your score."
              actionLabel="+ Add DSA Topic"
              onAction={() => window.location.href = '/student/dsa'}
            />
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                    {totalDsaSolved} / {totalDsaProblems} Solved
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Across {dsaEntries.length} Data Structure topics</div>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>
                  {dsaPercentage}%
                </div>
              </div>
              <ProgressBar progress={dsaPercentage} />
            </div>
          )}
        </div>
      </div>

      {/* Grid Row 3: Skill Gap Analysis & Job Matches */}
      <div className="grid-2" style={{ marginBottom: '20px' }}>
        {/* Skill Gap Analysis */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="var(--warning)" /> Skill Gap Analysis
            </h3>
            <Link to="/student/readiness" style={{ fontSize: '0.85rem' }}>Full Breakdown</Link>
          </div>

          {readiness?.skillGaps?.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No skill gap data recorded.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {readiness?.skillGaps?.slice(0, 3).map((gap, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#0f172a', borderRadius: '6px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{gap.skillName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Level: {gap.targetLevel}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: gap.gapPercentage > 30 ? 'var(--warning)' : 'var(--success)' }}>
                    {gap.gapPercentage}% gap
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Job Skill Matching */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} color="#a855f7" /> Matching Placement Jobs
            </h3>
            <Link to="/student/jobs" style={{ fontSize: '0.85rem' }}>Browse Jobs</Link>
          </div>

          {jobMatches.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No job opportunities available yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {jobMatches.slice(0, 3).map((m) => (
                <div key={m.job._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: '#0f172a', borderRadius: '6px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{m.job.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.job.company} • {m.job.location}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: m.matchPercentage >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                      {m.matchPercentage}%
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Match</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Next Skill Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lightbulb size={18} color="var(--warning)" /> Recommended Next Skill
          </h3>
          <Link to="/student/recommendations" style={{ fontSize: '0.85rem' }}>View Recommendations</Link>
        </div>

        {!topRecommendation ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '12px 0' }}>
            Complete more assessments and add skills to receive personalized AI recommendations.
          </div>
        ) : (
          <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{topRecommendation.skill.name}</h4>
              <span className="user-badge">{topRecommendation.priorityLevel}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>
              Category: {topRecommendation.skill.category}
            </p>
            <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
              <strong>Reason:</strong> {topRecommendation.reason}
            </div>
            <div style={{ marginTop: '16px' }}>
              <Link to="/student/skills" className="btn btn-primary btn-sm">
                Improve Skill Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
