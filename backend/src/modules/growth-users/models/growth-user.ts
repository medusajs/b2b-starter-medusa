import { BaseEntity } from "@medusajs/framework/utils";
import { Entity, Column, Index } from "typeorm";

@Entity("growth_users")
@Index(["email"], { unique: true })
@Index(["is_active"])
export class GrowthUser extends BaseEntity {
  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ type: "boolean", default: true })
  is_active: boolean;
}
