import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSmartCanteenSchema1730000000000
  implements MigrationInterface
{
  name = 'InitialSmartCanteenSchema1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "stalls" (
        "id" SERIAL NOT NULL,
        "name" character varying(150) NOT NULL,
        "location" character varying(255) NOT NULL,
        "is_open" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_stalls_name" UNIQUE ("name"),
        CONSTRAINT "PK_stalls_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "menus" (
        "id" SERIAL NOT NULL,
        "stall_id" integer NOT NULL,
        "name" character varying(150) NOT NULL,
        "category" character varying(50) NOT NULL,
        "price" integer NOT NULL,
        "stock" integer NOT NULL,
        "is_available" boolean NOT NULL DEFAULT true,
        "version" integer NOT NULL DEFAULT 1,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_menus_name" UNIQUE ("name"),
        CONSTRAINT "CHK_menus_category" CHECK ("category" IN ('makanan', 'minuman', 'snack')),
        CONSTRAINT "CHK_menus_price" CHECK ("price" >= 1000),
        CONSTRAINT "CHK_menus_stock" CHECK ("stock" >= 0),
        CONSTRAINT "PK_menus_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_menus_stall_id" FOREIGN KEY ("stall_id") REFERENCES "stalls"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" SERIAL NOT NULL,
        "customer_name" character varying(150) NOT NULL,
        "table_number" character varying(50) NOT NULL,
        "order_status" character varying(30) NOT NULL DEFAULT 'pending',
        "total_price" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_orders_status" CHECK ("order_status" IN ('pending', 'processing', 'completed', 'cancelled')),
        CONSTRAINT "PK_orders_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_items" (
        "id" SERIAL NOT NULL,
        "order_id" integer NOT NULL,
        "menu_id" integer NOT NULL,
        "quantity" integer NOT NULL,
        "price" integer NOT NULL,
        "subtotal" integer NOT NULL,
        "notes" character varying(255),
        CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_items_menu_id" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE RESTRICT
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "menus"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stalls"`);
  }
}
