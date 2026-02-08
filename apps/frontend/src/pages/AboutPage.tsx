import { Breadcrumb } from '../components/common/Breadcrumb';

type TeamMember = {
  name: string;
  affiliation: string;
  image: string;
  role?: string;
};

const defaultAvatar = '/sky-light-logo-icon.png';

const coreTeam: TeamMember[] = [
  { name: 'Aditya Desai', affiliation: 'Incoming Faculty at IIT Bombay | Post-Doc, UC Berkeley', image: 'https://github.com/apd10.png' },
  { name: 'Kumar Krishna Agrawal', affiliation: 'Graduate Student, UC Berkeley', image: 'https://github.com/kumarkrishna.png' },
  { name: 'Prithvi Dixit', affiliation: 'Undergraduate Student, UC Berkeley', image: 'https://github.com/Pd172944.png' },
  { name: 'Luis Gaspar Schroeder', affiliation: 'Founding Member of Technical Staff at UniversalAGI | Ex Grad Student, UC Berkeley', image: 'https://github.com/luis-gasparschroeder.png' },
];

const contributors: TeamMember[] = [
  { name: 'Sahil Joshi', affiliation: 'Graduate Student, Rice University', image: 'https://github.com/sahiljoshi515.png' },
  { name: 'Shuo Yang', affiliation: 'Graduate Student, UC Berkeley', image: 'https://github.com/andy-yang-1.png' },
  { name: 'Alejandro Cuadron', affiliation: 'Amazon UC Berkeley', image: 'https://github.com/AlexCuadron.png' },
];

const advisors: TeamMember[] = [
  {
    name: 'Ion Stoica',
    affiliation: 'UC Berkeley',
    image: 'https://people.eecs.berkeley.edu/~istoica/ion_picture_small.jpg',
    role: 'Advisor',
  },
  {
    name: 'Joseph E. Gonzalez',
    affiliation: 'UC Berkeley',
    image: 'https://people.eecs.berkeley.edu/~jegonzal/assets/jegonzal.jpg',
    role: 'Advisor',
  },
  {
    name: 'Matei Zaharia',
    affiliation: 'UC Berkeley',
    image: 'https://cs.stanford.edu/~matei/matei.jpg',
    role: 'Advisor',
  },
];

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
        <div className="text-lg font-semibold text-white">{member.name}</div>
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

export function AboutPage() {
  return (
    <div className="space-y-10">
      <Breadcrumb />

      <section className="space-y-4">
        <h1 className="text-4xl font-bold text-white">About SkyLight</h1>
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
    </div>
  );
}
