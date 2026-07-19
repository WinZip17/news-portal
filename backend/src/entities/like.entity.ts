import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Column } from 'typeorm';
import { User } from './user.entity';
import { News } from './news.entity';

@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => News)
  @JoinColumn({ name: 'newsId' })
  news: News;

  @Column()
  newsId: string;

  @CreateDateColumn()
  createdAt: Date;
}