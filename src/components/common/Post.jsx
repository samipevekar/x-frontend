import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaBookmark } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";

const Post = ({ post }) => {
	const [comment, setComment] = useState("");
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();

	const postOwner = post.repost && post.originalPost.user ? post.originalPost.user : post.user;
	const originalPost = post.repost ? post.originalPost : post;
	const isLiked = originalPost.likes.includes(authUser?._id);
	const isMyPost = authUser._id === post.user?._id;
	const formattedDate = formatPostDate(post.createdAt);
	// const isBookmarked = authUser.bookmarkedPosts.includes(originalPost?._id);
	const repost = post.repost;
	const repostedByMe = repost && authUser.username === post.user.username;

	const isInitiallyBookmarked = authUser.bookmarkedPosts.includes(originalPost?._id);
	const [isBookmarked, setIsBookmarked] = useState(isInitiallyBookmarked);


	// Handle delete post
	const { mutate: deletePost, isPending: isDeleting } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/posts/${post._id}`, { method: "DELETE" });
			const data = await res.json();

			if (!res.ok) throw new Error(data.error || "Something went wrong");

			return data;
		},
		onSuccess: () => {
			toast.success("Post deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["posts"] });

		},
	});

	// Handle like post
	const { mutate: likePost, isPending: isLiking } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/posts/like/${originalPost._id}`, { method: "POST" });
			const data = await res.json();

			if (!res.ok) throw new Error(data.error || "Something went wrong");

			return data;
		},
		onSuccess: (updatedLikes) => {
			queryClient.setQueryData(["posts"], (oldData) =>
				oldData.map((p) => {
					if (p._id === originalPost._id || (p.repost && p.originalPost._id === originalPost._id)) {
						return { ...p, likes: updatedLikes };
					}
					return p;
				})
			)
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	// Handle comment on post
	const { mutate: commentPost, isPending: isCommenting } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/posts/comment/${originalPost._id}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: comment }),
			});
			const data = await res.json();

			if (!res.ok) throw new Error(data.error || "Something went wrong");

			return data;
		},
		onSuccess: () => {
			toast.success("Comment posted successfully");
			queryClient.invalidateQueries(["posts"]);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	// Handle bookmark post
	const { mutate: bookmarkPost, isPending: isBookmarking } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/posts/bookmark/${originalPost._id}`, { method: "POST" });
			const data = await res.json();

			if (!res.ok) throw new Error(data.error || "Something went wrong");

			return data;
		},
		onSuccess: (updatedBookmarks) => {
			setIsBookmarked(!isBookmarked);
			queryClient.setQueryData(["posts"], (oldData) =>
				oldData?.map((p) => {
					if (p._id === originalPost._id) {
						return { ...p, bookmarkedPosts: updatedBookmarks };
					}
					return p;
				})
			);
			toast.success(isBookmarked ? "Post unbookmarked" : "Post bookmarked");

		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	// Handle repost
	const { mutate: repostPost, isPending: isReposting } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/posts/repost/${post._id}`, { method: "POST" });
			const data = await res.json();

			if (!res.ok) throw new Error(data.error || "Something went wrong");

			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['posts'] });
		},
		onError: (error) => {
			toast.error(error);
		},
	});

	const handleDeletePost = () => {
		if (isDeleting) return;
		deletePost()
	}
	const handlePostComment = (e) => {
		e.preventDefault();
		if (isCommenting) return;
		commentPost();
	};
	const handleLikePost = () => {
		if (isLiking) return;
		likePost();
	};
	const handleBookmarkPost = () => {
		if (isBookmarking) return;
		bookmarkPost();
	};
	const handleRepost = () => {
		if (isReposting) return;

		if (repost) {
			// If the current post is a repost, delete it
			deletePost();
		} else {
			// Otherwise, repost the original post
			repostPost();
		}
	};

	// const repostedByMe = authUser.username === post.user.username;

	return (
		<>
			<div className={`flex gap-2 items-start p-4 border-b border-gray-700 relative ${repost && "pt-12"}`}>
				{repost && <div className="absolute top-2 text-gray-400 font-bold flex items-center gap-2 text-[13px]"><BiRepost className="text-[18px]" /> {repostedByMe ? "You" : post.user.username} reposted</div>}
				<div className='avatar'>
					<Link to={`/profile/${postOwner.username}`} className='w-8 h-8 rounded-full overflow-hidden'>
						<img src={postOwner.profileImg || "/avatar-placeholder.png"} />
					</Link>
				</div>
				<div className='flex flex-col flex-1'>
					<div className='flex gap-2 items-center'>
						<Link to={`/profile/${postOwner.username}`} className='font-bold'>
							{postOwner.fullName}
						</Link>
						<span className='text-gray-700 flex gap-1 text-sm'>
							<Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
							<span>·</span>
							<span>{formattedDate}</span>
						</span>

						{isMyPost && (
							<span className='flex justify-end flex-1'>
								{!isDeleting && <FaTrash className='cursor-pointer hover:text-red-500' onClick={()=>document.getElementById('my_modal_1').showModal()} />}
								{isDeleting && (
									<LoadingSpinner size="sm" />
								)}
							</span>
						)}
						{/* confirmation modal for deleteing post */}
						<dialog id="my_modal_1" className="modal">
							<div className="modal-box rounded border border-gray-500">
								<h3 className="font-bold text-lg">Delete</h3>
								<p className="py-4">Do you want to delete this post?</p>
								<div className="modal-action">
									<form method="dialog">
										{/* if there is a button in form, it will close the modal */}
										<button className="btn text-white bg-gray-400 rounded">Close</button>
										<button className="btn text-white bg-red-600 rounded m-2" onClick={handleDeletePost}>Delete</button>
									</form>
								</div>
							</div>
						</dialog>
					</div>
					<div className='flex flex-col gap-3 overflow-hidden'>
						{/* Check if the post is a repost; if it is, display the original post's text */}
						<span>{repost ? originalPost.text : post.text}</span>
						{/* Check if the post (original or repost) has an image and display it */}
						{(repost ? originalPost.img : post.img) && (
							<img
								src={repost ? originalPost.img : post.img}
								className='h-80 object-contain rounded-lg border border-gray-700'
								alt=''
							/>
						)}
					</div>
					<div className='flex justify-between mt-3'>
						<div className='flex gap-4 items-center w-2/3 justify-between'>
							<div
								className='flex gap-1 items-center cursor-pointer group'
								onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
							>
								<FaRegComment className='w-4 h-4  text-slate-500 group-hover:text-sky-400' />
								<span className='text-sm text-slate-500 group-hover:text-sky-400'>
									{post.comments.length}
								</span>
							</div>
							{/* We're using Modal Component from DaisyUI */}
							<dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
								<div className='modal-box rounded border border-gray-600'>
									<h3 className='font-bold text-lg mb-4'>COMMENTS</h3>
									<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
										{post.comments.length === 0 && (
											<p className='text-sm text-slate-500'>
												No comments yet 🤔 Be the first one 😉
											</p>
										)}
										{post.comments.map((comment) => (
											<div key={comment._id} className='flex gap-2 items-start'>
												<div className='avatar'>
													<div className='w-8 rounded-full'>
														<img
															src={comment.user.profileImg || "/avatar-placeholder.png"}
														/>
													</div>
												</div>
												<div className='flex flex-col'>
													<div className='flex items-center gap-1'>
														<span className='font-bold'>{comment.user.fullName}</span>
														<span className='text-gray-700 text-sm'>
															@{comment.user.username}
														</span>
													</div>
													<div className='text-sm'>{comment.text}</div>
												</div>
											</div>
										))}
									</div>
									<form
										className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
										onSubmit={handlePostComment}
									>
										<textarea
											className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800'
											placeholder='Add a comment...'
											value={comment}
											onChange={(e) => setComment(e.target.value)}
										/>
										<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
											{isCommenting ? (
												<LoadingSpinner size="md" />
											) : (
												"Post"
											)}
										</button>
									</form>
								</div>
								<form method='dialog' className='modal-backdrop'>
									<button className='outline-none '>close</button>
								</form>
							</dialog>

							<div className='flex gap-1 items-center group cursor-pointer' onClick={handleRepost}>
								{isReposting ? <LoadingSpinner size={"sm"} /> : <BiRepost className={`w-6 h-6  ${repostedByMe ? "text-green-500" : "text-slate-500"}  group-hover:text-green-500`} />}
								<span className='text-sm text-slate-500 group-hover:text-green-500'>{post.repost.length}</span>
							</div>
							<div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
								{isLiking && <LoadingSpinner size="sm" />}
								{!isLiked && !isLiking && (
									<FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
								)}
								{isLiked && !isLiking && <FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' />}

								<span
									className={`text-sm  group-hover:text-pink-500 ${isLiked ? "text-pink-500" : "text-slate-500"
										}`}
								>
									{post.likes.length}
								</span>
							</div>
						</div>
						{!repost && <div className='flex w-1/3 justify-end gap-2 items-center' onClick={handleBookmarkPost}>
							{isBookmarking && <LoadingSpinner size={"sm"} />}
							{!isBookmarking && !isBookmarked && (
								<FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
							)}
							{isBookmarked && !isBookmarking && (
								<FaBookmark className="w-4 h-4 cursor-pointer" />
							)}

						</div>}
					</div>
				</div>
			</div>
		</>
	);
};
export default Post;