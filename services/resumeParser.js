const fs = require('fs');

class ResumeParser {
    async parseResume(filePath) {
        try {
            const dataBuffer = fs.readFileSync(filePath);
            const text = dataBuffer.toString();
            
            console.log('📄 Parsing resume, text length:', text.length);
            
            const parsedData = {
                name: this.extractName(text),
                email: this.extractEmail(text),
                phone: this.extractPhone(text),
                skills: this.extractSkills(text),
                experience: this.extractExperience(text),
                education: this.extractEducation(text),
                projects: this.extractProjects(text),
                summary: this.extractSummary(text),
                rawText: text.substring(0, 1000)
            };
            
            console.log('📊 Extracted:', {
                name: parsedData.name,
                skills: parsedData.skills.slice(0, 5),
                experience: parsedData.experience.slice(0, 2),
                projects: parsedData.projects.slice(0, 2)
            });
            
            return parsedData;
        } catch (error) {
            console.error('Error parsing resume:', error);
            return this.getDefaultData();
        }
    }

    extractName(text) {
        const lines = text.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (line && line.length > 0 && line.length < 50 && !line.includes('@') && !line.includes('http')) {
                return line;
            }
        }
        return 'Candidate';
    }

    extractEmail(text) {
        const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        return match ? match[0] : '';
    }

    extractPhone(text) {
        const match = text.match(/\d{10}/);
        return match ? match[0] : '';
    }

    extractSkills(text) {
        const skills = [];
        const commonSkills = [
            'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'MongoDB', 
            'SQL', 'PostgreSQL', 'MySQL', 'Git', 'Docker', 'Kubernetes', 'AWS', 
            'Azure', 'GCP', 'TypeScript', 'Angular', 'Vue.js', 'Express', 'Django',
            'Flask', 'REST API', 'GraphQL', 'Redux', 'Next.js', 'Tailwind CSS',
            'HTML', 'CSS', 'SASS', 'Bootstrap', 'PHP', 'Laravel', 'Ruby', 'Rails',
            'Swift', 'Kotlin', 'Flutter', 'React Native', 'TensorFlow', 'PyTorch'
        ];
        const lowerText = text.toLowerCase();
        
        commonSkills.forEach(skill => {
            if (lowerText.includes(skill.toLowerCase())) {
                skills.push(skill);
            }
        });
        
        return skills;
    }

    extractExperience(text) {
        const exp = [];
        const lines = text.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const lowerLine = line.toLowerCase();
            
            if (lowerLine.includes('experience') || lowerLine.includes('worked at') ||
                lowerLine.includes('developer') || lowerLine.includes('engineer') ||
                (lowerLine.includes('202') && (lowerLine.includes('present') || lowerLine.includes('202')))) {
                
                let expText = line;
                // Get next line for more context
                if (i + 1 < lines.length && lines[i+1].trim().length > 0) {
                    expText += ' ' + lines[i+1].trim();
                }
                exp.push(expText);
            }
        }
        
        return exp.slice(0, 5);
    }

    extractEducation(text) {
        const edu = [];
        const lines = text.split('\n');
        
        for (let line of lines) {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('b.tech') || lowerLine.includes('bachelor') || 
                lowerLine.includes('master') || lowerLine.includes('university') ||
                lowerLine.includes('college') || lowerLine.includes('degree') ||
                lowerLine.includes('m.tech') || lowerLine.includes('b.e')) {
                edu.push(line.trim());
            }
        }
        
        return edu.slice(0, 3);
    }

    extractProjects(text) {
        const projects = [];
        const lines = text.split('\n');
        
        for (let line of lines) {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('project') || lowerLine.includes('built using') ||
                lowerLine.includes('developed') || lowerLine.includes('created')) {
                projects.push(line.trim());
            }
        }
        
        return projects.slice(0, 5);
    }

    extractSummary(text) {
        const lines = text.split('\n');
        for (let line of lines) {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('summary') || lowerLine.includes('profile') || 
                lowerLine.includes('about me') || lowerLine.includes('objective')) {
                return line.trim();
            }
        }
        return '';
    }

    getDefaultData() {
        return {
            name: 'Candidate',
            email: '',
            phone: '',
            skills: ['JavaScript', 'React', 'Node.js'],
            experience: ['Software Developer'],
            education: ['Computer Science Degree'],
            projects: ['Software Project'],
            summary: '',
            rawText: ''
        };
    }
}

module.exports = new ResumeParser();