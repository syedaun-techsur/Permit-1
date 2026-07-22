import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ApplicantDashboardDto } from './dto/applicant-dashboard.dto';
import { ReviewerDashboardDto } from './dto/reviewer-dashboard.dto';
import { AdminDashboardDto } from './dto/admin-dashboard.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getApplicantDashboard(userId: string): Promise<ApplicantDashboardDto> {
    // activeApplications: submitted + under_review + additional_info_needed
    let activeApplications = 0;
    try {
      const [row] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM permit_applications
         WHERE applicant_id = $1 AND status IN ('submitted','under_review','additional_info_needed')`,
        [userId],
      );
      activeApplications = row?.count ?? 0;
    } catch (err) {
      this.logger.error('getApplicantDashboard: activeApplications query failed', err);
    }

    // actionRequired: additional_info_needed count
    let actionRequired = 0;
    try {
      const [row] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM permit_applications
         WHERE applicant_id = $1 AND status = 'additional_info_needed'`,
        [userId],
      );
      actionRequired = row?.count ?? 0;
    } catch (err) {
      this.logger.error('getApplicantDashboard: actionRequired query failed', err);
    }

    // unreadMessages: messages in applicant's applications where applicant hasn't read them
    // The messages table uses a message_reads join table (not is_read_by_applicant column)
    let unreadMessages = 0;
    try {
      const [row] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count
         FROM messages m
         JOIN permit_applications pa ON pa.id = m.application_id
         WHERE pa.applicant_id = $1
           AND m.sender_id != $1
           AND NOT EXISTS (
             SELECT 1 FROM message_reads mr
             WHERE mr.message_id = m.id AND mr.user_id = $1
           )`,
        [userId],
      );
      unreadMessages = row?.count ?? 0;
    } catch (err) {
      this.logger.error('getApplicantDashboard: unreadMessages query failed', err);
    }

    // recentApplications: last 5 by updated_at DESC
    let recentApplications: any[] = [];
    try {
      const rows = await this.dataSource.query(
        `SELECT
           pa.id,
           pa.reference_number AS "referenceNumber",
           pa.permit_type AS "permitType",
           pa.status,
           pa.updated_at AS "updatedAt",
           (
             SELECT COUNT(*)::int FROM messages m2
             WHERE m2.application_id = pa.id
               AND m2.sender_id != $1
               AND NOT EXISTS (
                 SELECT 1 FROM message_reads mr
                 WHERE mr.message_id = m2.id AND mr.user_id = $1
               )
           ) AS "unreadMessageCount"
         FROM permit_applications pa
         WHERE pa.applicant_id = $1
         ORDER BY pa.updated_at DESC
         LIMIT 5`,
        [userId],
      );
      recentApplications = rows.map((r: any) => ({
        id: r.id,
        referenceNumber: r.referenceNumber,
        permitType: r.permitType,
        status: r.status,
        updatedAt: r.updatedAt,
        unreadMessageCount: r.unreadMessageCount,
      }));
    } catch (err) {
      this.logger.error('getApplicantDashboard: recentApplications query failed', err);
    }

    // pendingActions: additional_info_needed applications
    let pendingActions: any[] = [];
    try {
      const rows = await this.dataSource.query(
        `SELECT id, reference_number AS "referenceNumber",
                info_request_note AS "infoRequestNote", updated_at AS "updatedAt"
         FROM permit_applications
         WHERE applicant_id = $1 AND status = 'additional_info_needed'
         ORDER BY updated_at ASC`,
        [userId],
      );
      pendingActions = rows.map((r: any) => ({
        id: r.id,
        referenceNumber: r.referenceNumber,
        infoRequestNote: r.infoRequestNote,
        updatedAt: r.updatedAt,
      }));
    } catch (err) {
      this.logger.error('getApplicantDashboard: pendingActions query failed', err);
    }

    // activityFeed: last 10 notifications for this user
    // Notifications table uses 'body' and 'read' columns
    let activityFeed: object[] = [];
    try {
      activityFeed = await this.dataSource.query(
        `SELECT id, type, body, application_id AS "applicationId",
                read AS "isRead", created_at AS "createdAt"
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 10`,
        [userId],
      );
    } catch (err) {
      this.logger.error('getApplicantDashboard: activityFeed query failed', err);
    }

    return {
      summaryCards: { activeApplications, actionRequired, unreadMessages },
      recentApplications,
      pendingActions,
      activityFeed,
    };
  }

  async getReviewerDashboard(userId: string): Promise<ReviewerDashboardDto> {
    // assignedApplications
    let assignedApplications = 0;
    try {
      const [row] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM permit_applications WHERE reviewer_id = $1`,
        [userId],
      );
      assignedApplications = row?.count ?? 0;
    } catch (err) {
      this.logger.error('getReviewerDashboard: assignedApplications query failed', err);
    }

    // awaitingResponse: applications assigned to reviewer with status additional_info_needed
    // (no permit_status_history table exists; use simple count of additional_info_needed)
    let awaitingResponse = 0;
    try {
      const [row] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM permit_applications
         WHERE reviewer_id = $1 AND status = 'additional_info_needed'`,
        [userId],
      );
      awaitingResponse = row?.count ?? 0;
    } catch (err) {
      this.logger.error('getReviewerDashboard: awaitingResponse query failed', err);
    }

    // unassignedInPool
    let unassignedInPool = 0;
    try {
      const [row] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM permit_applications
         WHERE reviewer_id IS NULL AND status = 'submitted'`,
      );
      unassignedInPool = row?.count ?? 0;
    } catch (err) {
      this.logger.error('getReviewerDashboard: unassignedInPool query failed', err);
    }

    // unreadMessages across reviewer's assigned applications
    // Uses message_reads join table
    let unreadMessages = 0;
    try {
      const [row] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count
         FROM messages m
         JOIN permit_applications pa ON pa.id = m.application_id
         WHERE pa.reviewer_id = $1
           AND m.sender_id != $1
           AND NOT EXISTS (
             SELECT 1 FROM message_reads mr
             WHERE mr.message_id = m.id AND mr.user_id = $1
           )`,
        [userId],
      );
      unreadMessages = row?.count ?? 0;
    } catch (err) {
      this.logger.error('getReviewerDashboard: unreadMessages query failed', err);
    }

    // priorityQueue: top 10 by priority order
    // submitted_at is the column name (not submission_date)
    let priorityQueue: any[] = [];
    try {
      const rows = await this.dataSource.query(
        `SELECT
           pa.id,
           pa.reference_number AS "referenceNumber",
           pa.permit_type AS "permitType",
           pa.status,
           EXTRACT(DAY FROM NOW() - pa.submitted_at)::int AS "daysSinceSubmission",
           (
             SELECT u.full_name FROM users u WHERE u.id = pa.applicant_id
           ) AS "applicantName",
           (
             SELECT COUNT(*)::int FROM messages m
             WHERE m.application_id = pa.id
               AND m.sender_id != $1
               AND NOT EXISTS (
                 SELECT 1 FROM message_reads mr
                 WHERE mr.message_id = m.id AND mr.user_id = $1
               )
           ) AS "unreadMessageCount"
         FROM permit_applications pa
         WHERE (pa.reviewer_id = $1 OR (pa.reviewer_id IS NULL AND pa.status = 'submitted'))
           AND pa.status NOT IN ('approved','rejected','draft')
         ORDER BY
           CASE pa.status
             WHEN 'additional_info_needed' THEN 1
             WHEN 'submitted' THEN 2
             WHEN 'under_review' THEN 3
             ELSE 4
           END,
           pa.submitted_at ASC NULLS LAST
         LIMIT 10`,
        [userId],
      );
      priorityQueue = rows.map((r: any) => ({
        id: r.id,
        referenceNumber: r.referenceNumber,
        permitType: r.permitType,
        applicantName: r.applicantName || '',
        status: r.status,
        daysSinceSubmission: r.daysSinceSubmission ?? 0,
        unreadMessageCount: r.unreadMessageCount,
      }));
    } catch (err) {
      this.logger.error('getReviewerDashboard: priorityQueue query failed', err);
    }

    // atRiskApplications: under_review, assigned to reviewer, no status change > 3 days
    let atRiskApplications: any[] = [];
    try {
      const rows = await this.dataSource.query(
        `SELECT
           pa.id,
           pa.reference_number AS "referenceNumber",
           pa.permit_type AS "permitType",
           pa.status,
           EXTRACT(DAY FROM NOW() - pa.submitted_at)::int AS "daysSinceSubmission",
           (SELECT u.full_name FROM users u WHERE u.id = pa.applicant_id) AS "applicantName",
           0 AS "unreadMessageCount"
         FROM permit_applications pa
         WHERE pa.reviewer_id = $1
           AND pa.status = 'under_review'
           AND pa.updated_at < NOW() - INTERVAL '3 days'
         ORDER BY pa.updated_at ASC
         LIMIT 5`,
        [userId],
      );
      atRiskApplications = rows.map((r: any) => ({
        id: r.id,
        referenceNumber: r.referenceNumber,
        permitType: r.permitType,
        applicantName: r.applicantName || '',
        status: r.status,
        daysSinceSubmission: r.daysSinceSubmission ?? 0,
        unreadMessageCount: 0,
      }));
    } catch (err) {
      this.logger.error('getReviewerDashboard: atRiskApplications query failed', err);
    }

    // activityFeed: last 10 audit_log entries for reviewer's assigned apps
    // Table is audit_log (not audit_logs), uses occurred_at and details JSONB
    let activityFeed: object[] = [];
    try {
      activityFeed = await this.dataSource.query(
        `SELECT al.id, al.action, al.details AS metadata, al.occurred_at AS "createdAt",
                al.actor_role AS "actorRole", al.application_id AS "applicationId"
         FROM audit_log al
         WHERE al.application_id IN (
           SELECT id FROM permit_applications WHERE reviewer_id = $1
         )
         ORDER BY al.occurred_at DESC
         LIMIT 10`,
        [userId],
      );
    } catch (err) {
      this.logger.error('getReviewerDashboard: activityFeed query failed', err);
    }

    return {
      summaryCards: {
        assignedApplications,
        awaitingResponse,
        unassignedInPool,
        unreadMessages,
      },
      priorityQueue,
      atRiskApplications,
      activityFeed,
    };
  }

  async getAdminDashboard(): Promise<AdminDashboardDto> {
    // totalApplications
    let totalApplications = 0;
    try {
      const [row] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM permit_applications`,
      );
      totalApplications = row?.count ?? 0;
    } catch (err) {
      this.logger.error('getAdminDashboard: totalApplications query failed', err);
    }

    // activeApplications (not in terminal state)
    let activeApplications = 0;
    try {
      const [row] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM permit_applications
         WHERE status NOT IN ('approved','rejected','draft')`,
      );
      activeApplications = row?.count ?? 0;
    } catch (err) {
      this.logger.error('getAdminDashboard: activeApplications query failed', err);
    }

    // submittedThisWeek
    let submittedThisWeek = 0;
    try {
      const [row] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM permit_applications
         WHERE submitted_at >= NOW() - INTERVAL '7 days'`,
      );
      submittedThisWeek = row?.count ?? 0;
    } catch (err) {
      this.logger.error('getAdminDashboard: submittedThisWeek query failed', err);
    }

    // decisionsThisWeek (approved or rejected this week)
    let decisionsThisWeek = 0;
    try {
      const [row] = await this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM permit_applications
         WHERE status IN ('approved','rejected')
           AND updated_at >= NOW() - INTERVAL '7 days'`,
      );
      decisionsThisWeek = row?.count ?? 0;
    } catch (err) {
      this.logger.error('getAdminDashboard: decisionsThisWeek query failed', err);
    }

    // statusDistribution
    let statusDistribution: any[] = [];
    try {
      const rows = await this.dataSource.query(
        `SELECT status::text, COUNT(*)::int AS count
         FROM permit_applications
         GROUP BY status
         ORDER BY count DESC`,
      );
      statusDistribution = rows.map((r: any) => ({
        status: r.status,
        count: r.count,
      }));
    } catch (err) {
      this.logger.error('getAdminDashboard: statusDistribution query failed', err);
    }

    // reviewerWorkload
    let reviewerWorkload: any[] = [];
    try {
      const rows = await this.dataSource.query(
        `SELECT
           u.id AS "reviewerId",
           u.full_name AS "reviewerName",
           COUNT(pa.id) FILTER (WHERE pa.status NOT IN ('approved','rejected','draft'))::int AS assigned,
           COUNT(pa.id) FILTER (WHERE pa.status = 'under_review')::int AS "underReview",
           COUNT(pa.id) FILTER (WHERE pa.status = 'additional_info_needed')::int AS "additionalInfoNeeded",
           COUNT(pa.id) FILTER (WHERE pa.status IN ('approved','rejected') AND pa.updated_at >= NOW() - INTERVAL '7 days')::int AS "decidedThisWeek"
         FROM users u
         LEFT JOIN permit_applications pa ON pa.reviewer_id = u.id
         WHERE u.role = 'reviewer' AND u.is_active = TRUE
         GROUP BY u.id, u.full_name
         ORDER BY assigned DESC`,
      );
      reviewerWorkload = rows.map((r: any) => ({
        reviewerId: r.reviewerId,
        reviewerName: r.reviewerName,
        assigned: r.assigned,
        underReview: r.underReview,
        additionalInfoNeeded: r.additionalInfoNeeded,
        decidedThisWeek: r.decidedThisWeek,
      }));
    } catch (err) {
      this.logger.error('getAdminDashboard: reviewerWorkload query failed', err);
    }

    // recentActivity: last 20 audit_log entries system-wide
    // Table is audit_log, uses occurred_at, details JSONB, actor_role stored directly
    let recentActivity: object[] = [];
    try {
      recentActivity = await this.dataSource.query(
        `SELECT al.id, al.action, al.details AS metadata, al.occurred_at AS "createdAt",
                al.application_id AS "applicationId", al.actor_role AS "actorRole"
         FROM audit_log al
         ORDER BY al.occurred_at DESC
         LIMIT 20`,
      );
    } catch (err) {
      this.logger.error('getAdminDashboard: recentActivity query failed', err);
    }

    return {
      summaryCards: {
        totalApplications,
        activeApplications,
        submittedThisWeek,
        decisionsThisWeek,
      },
      statusDistribution,
      reviewerWorkload,
      recentActivity,
    };
  }
}
