import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum NewsCategory {
    POLITICS = 'politics',
    ECONOMY = 'economy',
    TECHNOLOGY = 'technology',
    SCIENCE = 'science',
    SPORTS = 'sports',
    ENTERTAINMENT = 'entertainment',
    HEALTH = 'health',
    WORLD = 'world',
    OTHER = 'other',
}

export enum NewsStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    PUBLISHED = 'published',
    REJECTED = 'rejected',
    ARCHIVED = 'archived',
}

@Entity('news')
export class News {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'text', nullable: true })
    summary: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ nullable: true })
    source: string;

    @Column({ nullable: true })
    sourceUrl: string;

    @Column({
        type: 'enum',
        enum: NewsCategory,
        default: NewsCategory.OTHER,
    })
    category: NewsCategory;

    @Column({ type: 'simple-array', nullable: true })
    tags: string[];

    @Column({
        type: 'enum',
        enum: NewsStatus,
        default: NewsStatus.DRAFT,
    })
    status: NewsStatus;

    @Column({ default: false })
    isAiGenerated: boolean;

    @Column({ default: 0 })
    views: number;

    @Column({ default: 0 })
    likes: number;

    @ManyToOne(() => User, (user) => user.news, { nullable: true })
    @JoinColumn({ name: 'authorId' })
    author: User;

    @Column({ nullable: true })
    authorId: string;

    @Column({ nullable: true })
    moderatedBy: string;

    @Column({ nullable: true })
    moderatedAt: Date;

    @Column({ nullable: true })
    moderationComment: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    publishedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}