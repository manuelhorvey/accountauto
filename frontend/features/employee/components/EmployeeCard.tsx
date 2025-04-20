'use client';

import styles from './EmployeeCard.module.css';
import { Employee } from '@/lib/api';
import { useRouter } from 'next/navigation';

type EmployeeCardProps = {
    employee: Employee;
};

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/dashboard/employees/${employee._id}`);
    };

    return (
        <div className={styles.card} onClick={handleClick}>
            <h2 className={styles.name}>
                {employee.first_name} {employee.last_name}
            </h2>
            <p className={styles.status}>Status: {employee.status}</p>
            <p className={styles.phone}>📞 {employee.phone}</p>
        </div>
    );
};

export default EmployeeCard;
