--
-- PostgreSQL database dump
--

\restrict 9SrCNzosuozTfVG9JH0bGNjzsAplByG4aJozqRy8mpsfq3ImC9fbRi1ThG07VkS

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: init_user_point(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.init_user_point() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  -- Chỉ tạo user_point cho user có role là bidder hoặc seller
  if NEW.role in ('bidder', 'seller') then
    insert into public.user_point (
      id_user,
      judge_point,
      number_of_minus,
      number_of_plus
    )
    values (
      NEW.id_user,
      0,
      0,
      0
    );
  end if;

  return NEW;
end;
$$;


--
-- Name: remove_accents(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.remove_accents(text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $_$
SELECT translate(
    lower($1),
    'àáạảãâầấậẩẫăằắặẳẵđèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹ',
    'aaaaaaaaaaaaaaaaadeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyy'
);
$_$;


--
-- Name: trg_rating_to_user_point(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_rating_to_user_point() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  inc_plus  integer := 0;
  inc_minus integer := 0;
  total     integer;
BEGIN
  -- Validate rating_point
  IF NEW.rating_point = 1 THEN
    inc_plus := 1;
  ELSIF NEW.rating_point = -1 THEN
    inc_minus := 1;
  ELSE
    RAISE EXCEPTION 'rating_point must be 1 or -1';
  END IF;

  -- Insert hoặc update user_point
  INSERT INTO user_point (
    id_user,
    number_of_plus,
    number_of_minus,
    judge_point
  )
  VALUES (
    NEW.reviewee_id,
    inc_plus,
    inc_minus,
    CASE
      WHEN (inc_plus + inc_minus) = 0 THEN 0
      ELSE inc_plus::numeric / (inc_plus + inc_minus)
    END
  )
  ON CONFLICT (id_user)
  DO UPDATE SET
    number_of_plus = user_point.number_of_plus + inc_plus,
    number_of_minus = user_point.number_of_minus + inc_minus,
    judge_point = ROUND(
      (user_point.number_of_plus + inc_plus)::numeric /
      (user_point.number_of_plus + user_point.number_of_minus + inc_plus + inc_minus),
      4
    );

  RETURN NEW;
END;
$$;


--
-- Name: trg_update_user_point_after_judge(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trg_update_user_point_after_judge() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  new_plus  integer := 0;
  new_minus integer := 0;
BEGIN
  -- Xác định loại đánh giá
  IF NEW.rating_point = 1 THEN
    new_plus := 1;
  ELSIF NEW.rating_point = -1 THEN
    new_minus := 1;
  ELSE
    RAISE EXCEPTION 'Invalid rating_point: must be 1 or -1';
  END IF;

  -- Insert hoặc update user_point
  INSERT INTO user_point (id_user, number_of_plus, number_of_minus, judge_point)
  VALUES (
    NEW.id_user,
    new_plus,
    new_minus,
    CASE
      WHEN (new_plus + new_minus) = 0 THEN 0
      ELSE new_plus::numeric / (new_plus + new_minus)
    END
  )
  ON CONFLICT (id_user)
  DO UPDATE SET
    number_of_plus = user_point.number_of_plus + new_plus,
    number_of_minus = user_point.number_of_minus + new_minus,
    judge_point = ROUND(
      (user_point.number_of_plus + new_plus)::numeric /
      (user_point.number_of_plus + user_point.number_of_minus + new_plus + new_minus),
      4
    );

  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auction_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auction_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    extend_threshold_minutes integer DEFAULT 5 NOT NULL,
    extend_duration_minutes integer DEFAULT 10 NOT NULL
);


--
-- Name: auto_bid; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auto_bid (
    id_bid uuid DEFAULT gen_random_uuid() NOT NULL,
    id_user uuid NOT NULL,
    id_product uuid NOT NULL,
    bid_price numeric,
    max_bid numeric NOT NULL
);


--
-- Name: bid; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bid (
    id_bid uuid DEFAULT gen_random_uuid() NOT NULL,
    id_user uuid NOT NULL,
    id_product uuid NOT NULL,
    "time" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
    bid_price numeric NOT NULL,
    is_auto_bid boolean DEFAULT false
);


--
-- Name: bid_request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bid_request (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    id_bidder uuid NOT NULL,
    id_seller uuid NOT NULL,
    id_product uuid NOT NULL,
    bid_price numeric(15,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT bid_request_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.category (
    id_category uuid DEFAULT gen_random_uuid() NOT NULL,
    name_category text NOT NULL,
    id_parent_category uuid,
    fts tsvector GENERATED ALWAYS AS (to_tsvector('english'::regconfig, public.remove_accents(name_category))) STORED,
    is_deleted boolean DEFAULT false
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id_comment uuid DEFAULT gen_random_uuid() NOT NULL,
    id_product uuid NOT NULL,
    id_user uuid NOT NULL,
    user_name character varying(255),
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id_parent_comment uuid,
    reply_to_user character varying(255)
);


--
-- Name: description_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.description_history (
    id_product uuid NOT NULL,
    "time" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
    description text NOT NULL
);


--
-- Name: forgot_password; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forgot_password (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text,
    otp text,
    expire_at timestamp without time zone
);


--
-- Name: kick; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kick (
    id_user uuid DEFAULT gen_random_uuid() NOT NULL,
    id_product uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product (
    id_product uuid DEFAULT gen_random_uuid() NOT NULL,
    id_category uuid NOT NULL,
    avatar text,
    name text NOT NULL,
    price numeric,
    immediate_purchase_price numeric,
    posted_date_time timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
    end_date_time timestamp with time zone,
    description text,
    judge_point numeric,
    pricing_step numeric,
    starting_price numeric,
    url_img text[],
    fts tsvector GENERATED ALWAYS AS (to_tsvector('english'::regconfig, ((public.remove_accents(name) || ' '::text) || public.remove_accents(description)))) STORED,
    updated_by uuid,
    created_by uuid,
    status text DEFAULT 'active'::text
);


--
-- Name: rating; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rating (
    id_rating uuid DEFAULT gen_random_uuid() NOT NULL,
    id_product uuid NOT NULL,
    reviewer_id uuid NOT NULL,
    reviewee_id uuid NOT NULL,
    reviewer_role text NOT NULL,
    rating_point numeric NOT NULL,
    content text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT rating_rating_point_check CHECK ((rating_point = ANY (ARRAY[(1)::numeric, ('-1'::integer)::numeric]))),
    CONSTRAINT rating_reviewer_role_check CHECK ((reviewer_role = ANY (ARRAY['seller'::text, 'bidder'::text])))
);


--
-- Name: transport; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transport (
    id_bill uuid DEFAULT gen_random_uuid() NOT NULL,
    id_product uuid NOT NULL,
    id_user uuid
);


--
-- Name: upgrade_request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.upgrade_request (
    id_request uuid DEFAULT gen_random_uuid() NOT NULL,
    id_user uuid NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    reviewed_at timestamp without time zone,
    reviewed_by uuid,
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval)
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id_user uuid DEFAULT gen_random_uuid() NOT NULL,
    fullname text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    date_of_birth date,
    role text NOT NULL,
    status text DEFAULT '"Active"'::text NOT NULL,
    slug text
);


--
-- Name: user_point; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_point (
    id_user uuid NOT NULL,
    judge_point numeric NOT NULL,
    number_of_minus numeric,
    number_of_plus numeric
);


--
-- Name: verify_email; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verify_email (
    id integer NOT NULL,
    id_user uuid NOT NULL,
    token character varying(255) NOT NULL,
    expire_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false
);


--
-- Name: verify_email_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.verify_email_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: verify_email_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.verify_email_id_seq OWNED BY public.verify_email.id;


--
-- Name: watch_list; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.watch_list (
    id_user uuid NOT NULL,
    id_product uuid NOT NULL
);


--
-- Name: winner_order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.winner_order (
    id_order uuid DEFAULT gen_random_uuid() NOT NULL,
    id_product uuid NOT NULL,
    id_user uuid NOT NULL,
    payment_bill text,
    address text NOT NULL,
    b_l text,
    status text DEFAULT 'pending_payment'::text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: verify_email id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verify_email ALTER COLUMN id SET DEFAULT nextval('public.verify_email_id_seq'::regclass);


--
-- Name: auto_bid AutoBid_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_bid
    ADD CONSTRAINT "AutoBid_pkey" PRIMARY KEY (id_bid);


--
-- Name: auction_settings auction_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auction_settings
    ADD CONSTRAINT auction_settings_pkey PRIMARY KEY (id);


--
-- Name: bid bid_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid
    ADD CONSTRAINT bid_pkey PRIMARY KEY (id_bid);


--
-- Name: bid_request bid_request_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_request
    ADD CONSTRAINT bid_request_pkey PRIMARY KEY (id);


--
-- Name: category category_name_category_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_name_category_key UNIQUE (name_category);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id_category);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id_comment);


--
-- Name: description_history description_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.description_history
    ADD CONSTRAINT description_history_pkey PRIMARY KEY (id_product, "time");


--
-- Name: forgot_password forgot_password_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forgot_password
    ADD CONSTRAINT forgot_password_pkey PRIMARY KEY (id);


--
-- Name: kick kick_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kick
    ADD CONSTRAINT kick_pkey PRIMARY KEY (id_user, id_product);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id_product);


--
-- Name: rating rating_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_pkey PRIMARY KEY (id_rating);


--
-- Name: rating rating_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_unique UNIQUE (id_product, reviewer_id, reviewee_id);


--
-- Name: transport transport_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transport
    ADD CONSTRAINT transport_pkey PRIMARY KEY (id_bill);


--
-- Name: upgrade_request upgrade_request_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upgrade_request
    ADD CONSTRAINT upgrade_request_pkey PRIMARY KEY (id_request);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id_user);


--
-- Name: user_point user_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_point
    ADD CONSTRAINT user_type_pkey PRIMARY KEY (id_user);


--
-- Name: verify_email verify_email_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verify_email
    ADD CONSTRAINT verify_email_pkey PRIMARY KEY (id);


--
-- Name: watch_list watch_list_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watch_list
    ADD CONSTRAINT watch_list_pkey PRIMARY KEY (id_user, id_product);


--
-- Name: winner_order winner_order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.winner_order
    ADD CONSTRAINT winner_order_pkey PRIMARY KEY (id_order);


--
-- Name: category_fts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX category_fts ON public.category USING gin (fts);


--
-- Name: product_fts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_fts ON public.product USING gin (fts);


--
-- Name: rating after_insert_rating; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER after_insert_rating AFTER INSERT ON public.rating FOR EACH ROW EXECUTE FUNCTION public.trg_rating_to_user_point();


--
-- Name: user trg_init_user_point; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_init_user_point AFTER INSERT ON public."user" FOR EACH ROW EXECUTE FUNCTION public.init_user_point();


--
-- Name: auto_bid auto_bid_id_product_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_bid
    ADD CONSTRAINT auto_bid_id_product_fkey FOREIGN KEY (id_product) REFERENCES public.product(id_product);


--
-- Name: auto_bid auto_bid_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_bid
    ADD CONSTRAINT auto_bid_id_user_fkey FOREIGN KEY (id_user) REFERENCES public."user"(id_user);


--
-- Name: bid bid_id_product_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid
    ADD CONSTRAINT bid_id_product_fkey FOREIGN KEY (id_product) REFERENCES public.product(id_product);


--
-- Name: bid bid_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid
    ADD CONSTRAINT bid_id_user_fkey FOREIGN KEY (id_user) REFERENCES public."user"(id_user);


--
-- Name: bid_request bid_request_id_bidder_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_request
    ADD CONSTRAINT bid_request_id_bidder_fkey FOREIGN KEY (id_bidder) REFERENCES public."user"(id_user);


--
-- Name: bid_request bid_request_id_product_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_request
    ADD CONSTRAINT bid_request_id_product_fkey FOREIGN KEY (id_product) REFERENCES public.product(id_product);


--
-- Name: bid_request bid_request_id_seller_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bid_request
    ADD CONSTRAINT bid_request_id_seller_fkey FOREIGN KEY (id_seller) REFERENCES public."user"(id_user);


--
-- Name: comments comments_id_parent_comment_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_id_parent_comment_fkey FOREIGN KEY (id_parent_comment) REFERENCES public.comments(id_comment) ON DELETE CASCADE;


--
-- Name: comments comments_id_product_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_id_product_fkey FOREIGN KEY (id_product) REFERENCES public.product(id_product);


--
-- Name: comments comments_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_id_user_fkey FOREIGN KEY (id_user) REFERENCES public."user"(id_user);


--
-- Name: description_history description_history_id_product_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.description_history
    ADD CONSTRAINT description_history_id_product_fkey FOREIGN KEY (id_product) REFERENCES public.product(id_product) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: kick kick_id_product_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kick
    ADD CONSTRAINT kick_id_product_fkey FOREIGN KEY (id_product) REFERENCES public.product(id_product);


--
-- Name: kick kick_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kick
    ADD CONSTRAINT kick_id_user_fkey FOREIGN KEY (id_user) REFERENCES public."user"(id_user);


--
-- Name: product product_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_created_by_fkey FOREIGN KEY (created_by) REFERENCES public."user"(id_user) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product product_id_category_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_id_category_fkey FOREIGN KEY (id_category) REFERENCES public.category(id_category);


--
-- Name: product product_update_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_update_by_fkey FOREIGN KEY (updated_by) REFERENCES public."user"(id_user);


--
-- Name: rating rating_product_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_product_fkey FOREIGN KEY (id_product) REFERENCES public.product(id_product);


--
-- Name: rating rating_reviewee_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_reviewee_fkey FOREIGN KEY (reviewee_id) REFERENCES public."user"(id_user);


--
-- Name: rating rating_reviewer_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_reviewer_fkey FOREIGN KEY (reviewer_id) REFERENCES public."user"(id_user);


--
-- Name: transport transport_id_product_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transport
    ADD CONSTRAINT transport_id_product_fkey FOREIGN KEY (id_product) REFERENCES public.product(id_product);


--
-- Name: transport transport_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transport
    ADD CONSTRAINT transport_id_user_fkey FOREIGN KEY (id_user) REFERENCES public."user"(id_user);


--
-- Name: upgrade_request upgrade_request_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upgrade_request
    ADD CONSTRAINT upgrade_request_id_user_fkey FOREIGN KEY (id_user) REFERENCES public."user"(id_user) ON DELETE CASCADE;


--
-- Name: upgrade_request upgrade_request_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.upgrade_request
    ADD CONSTRAINT upgrade_request_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public."user"(id_user);


--
-- Name: user_point user_type_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_point
    ADD CONSTRAINT user_type_id_user_fkey FOREIGN KEY (id_user) REFERENCES public."user"(id_user);


--
-- Name: watch_list watch_list_id_product_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watch_list
    ADD CONSTRAINT watch_list_id_product_fkey FOREIGN KEY (id_product) REFERENCES public.product(id_product);


--
-- Name: watch_list watch_list_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.watch_list
    ADD CONSTRAINT watch_list_id_user_fkey FOREIGN KEY (id_user) REFERENCES public."user"(id_user);


--
-- Name: winner_order winner_order_id_product_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.winner_order
    ADD CONSTRAINT winner_order_id_product_fkey FOREIGN KEY (id_product) REFERENCES public.product(id_product);


--
-- Name: winner_order winner_order_id_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.winner_order
    ADD CONSTRAINT winner_order_id_user_fkey FOREIGN KEY (id_user) REFERENCES public."user"(id_user);


--
-- Name: auction_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.auction_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: auto_bid; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.auto_bid ENABLE ROW LEVEL SECURITY;

--
-- Name: bid; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bid ENABLE ROW LEVEL SECURITY;

--
-- Name: bid_request; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bid_request ENABLE ROW LEVEL SECURITY;

--
-- Name: category; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.category ENABLE ROW LEVEL SECURITY;

--
-- Name: comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

--
-- Name: description_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.description_history ENABLE ROW LEVEL SECURITY;

--
-- Name: forgot_password; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.forgot_password ENABLE ROW LEVEL SECURITY;

--
-- Name: kick; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.kick ENABLE ROW LEVEL SECURITY;

--
-- Name: product; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product ENABLE ROW LEVEL SECURITY;

--
-- Name: transport; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transport ENABLE ROW LEVEL SECURITY;

--
-- Name: upgrade_request; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.upgrade_request ENABLE ROW LEVEL SECURITY;

--
-- Name: user; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_point; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_point ENABLE ROW LEVEL SECURITY;

--
-- Name: verify_email; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.verify_email ENABLE ROW LEVEL SECURITY;

--
-- Name: watch_list; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.watch_list ENABLE ROW LEVEL SECURITY;

--
-- Name: winner_order; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.winner_order ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict 9SrCNzosuozTfVG9JH0bGNjzsAplByG4aJozqRy8mpsfq3ImC9fbRi1ThG07VkS

