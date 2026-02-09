type TeamMember = {
  name: string;
  affiliation: string;
  image: string;
  role?: string;
  linkedinUrl?: string;
};

const defaultAvatar = '/sky-light-logo-icon.png';

const coreTeam: TeamMember[] = [
  { name: 'Aditya Desai', affiliation: 'Incoming Faculty at IIT Bombay | Post-Doc, UC Berkeley', image: 'https://github.com/apd10.png', linkedinUrl: 'https://www.linkedin.com/in/aditya-desai-ai/' },
  { name: 'Kumar Krishna Agrawal', affiliation: 'Graduate Student, UC Berkeley', image: 'https://github.com/kumarkrishna.png', linkedinUrl: 'https://www.linkedin.com/in/kumar-krishna-agrawal/' },
  { name: 'Prithvi Dixit', affiliation: 'Undergraduate Student, UC Berkeley', image: 'https://github.com/Pd172944.png', linkedinUrl: 'https://www.linkedin.com/in/prithvidixit/' },
  { name: 'Luis Gaspar Schroeder', affiliation: 'Founding Member of Technical Staff at UniversalAGI | Ex Grad Student, UC Berkeley', image: 'https://github.com/luis-gasparschroeder.png', linkedinUrl: 'https://www.linkedin.com/in/luis-gaspar-schroeder/' },
];

const contributors: TeamMember[] = [
  { name: 'Sahil Joshi', affiliation: 'Graduate Student, Rice University', image: 'https://github.com/sahiljoshi515.png', linkedinUrl: 'https://www.linkedin.com/in/sahiljoshi515/' },
  { name: 'Shuo Yang', affiliation: 'Graduate Student, UC Berkeley', image: 'https://github.com/andy-yang-1.png', linkedinUrl: 'https://www.linkedin.com/in/shuo-yang-79940b287/' },
  { name: 'Alejandro Cuadron', affiliation: 'Amazon | Ex-Grad Student, UC Berkeley', image: 'https://github.com/AlexCuadron.png', linkedinUrl: 'https://www.linkedin.com/in/acuadron/' },
];

const advisors: TeamMember[] = [
  {
    name: 'Ion Stoica',
    affiliation: 'UC Berkeley',
    image: 'https://people.eecs.berkeley.edu/~istoica/ion_picture_small.jpg',
    role: 'Advisor',
    linkedinUrl: 'https://www.linkedin.com/in/ionstoica/',
  },
  {
    name: 'Joseph E. Gonzalez',
    affiliation: 'UC Berkeley',
    image: 'https://people.eecs.berkeley.edu/~jegonzal/assets/jegonzal.jpg',
    role: 'Advisor',
    linkedinUrl: 'https://www.linkedin.com/in/profjoeyg/',
  },
  {
    name: 'Matei Zaharia',
    affiliation: 'UC Berkeley',
    image: 'https://cs.stanford.edu/~matei/matei.jpg',
    role: 'Advisor',
    linkedinUrl: 'https://www.linkedin.com/in/mateizaharia/',
  },
];

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6 flex items-center gap-4">
      <img
        src={member.image || defaultAvatar}
        alt={member.name}
        className="w-16 h-16 rounded-full object-cover border border-dark-border bg-dark-bg"
        onError={(event) => {
          event.currentTarget.src = defaultAvatar;
        }}
      />
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-white">{member.name}</span>
          {member.linkedinUrl && (
            <a
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} on LinkedIn`}
              className="text-gray-400 hover:text-[#0A66C2] transition-colors"
            >
              <LinkedInIcon className="w-4 h-4" />
            </a>
          )}
        </div>
        {member.role && <div className="text-sm text-accent-gold">{member.role}</div>}
        <div className="text-sm text-gray-400">{member.affiliation}</div>
      </div>
    </div>
  );
}

function TeamSection({
  title,
  description,
  members,
}: {
  title: string;
  description?: string;
  members: TeamMember[];
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {description && <p className="text-gray-400 mt-2 max-w-3xl">{description}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <TeamMemberCard key={`${title}-${member.name}-${member.affiliation}`} member={member} />
        ))}
      </div>
    </section>
  );
}

import { PageLayout } from '../components/layout/PageLayout';

export function AboutPage() {
  return (
    <PageLayout spacing="large" maxWidth="full">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold text-accent-gold font-quantico">About SkyLight</h1>
        <p className="text-lg text-gray-400 max-w-3xl">
          A unified platform to understand, compare, and advance efficiency in AI training and
          inference. We identify and create a ecosystem to enable research and development 
        </p>
        <div className="space-y-3 max-w-3xl text-gray-400">
          <h2 className="text-xl font-semibold text-white">Why SkyLight is for you</h2>
          <ul className="space-y-3">
            <li>
              <span className="font-semibold text-white">Researchers</span>
              <p>
                Track the state of the art, rapidly prototype new ideas, and fairly evaluate them
                against existing methods.
              </p>
            </li>
            <li>
              <span className="font-semibold text-white">Systems Engineers</span>
              <p>
                Compare efficiency techniques end-to-end and decide what is worth integrating into
                real inference and training engines.
              </p>
            </li>
            <li>
              <span className="font-semibold text-white">Industry Practitioners</span>
              <p>
                Get a holistic, apples-to-apples view of results to assess real-world impact before
                committing to adoption.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <TeamSection
        title="Core Team"
        description="The core team drives the research direction, engineering, and public releases."
        members={coreTeam}
      />

      <TeamSection
        title="Contributors"
        description="Community members who have contributed code, datasets, and tooling, etc"
        members={contributors}
      />

      <TeamSection
        title="Advisors"
        description="Advisors guiding the long-term vision."
        members={advisors}
      />
    </PageLayout>
  );
}
