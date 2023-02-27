import { type NextPage } from "next";
import Link from "next/link";


const Sign_up: NextPage = () => {

    return (
            <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-lg text-center">
                <div className="mx-auto max-w-lg text-center">
                    <h1 className="text-2xl font-bold sm:text-3xl">No account, no problem!</h1>
                    <h2 className="font-bold text-gray-700 sm:text-15xl">Create an Account for Free</h2>
                </div>
                    <form action="" className="mx-auto mt-8 mb-0 max-w-md space-y-4">
                        <div>
                            <label className="sr-only">Email</label>

                            <div className="relative">
                                <input
                                    type="email"
                                    className="w-full rounded-lg border-gray-200 p-4 pr-12 text-sm shadow-sm"
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div>
                                <label className="sr-only">Create a Password</label>

                                <div className="relative">
                                    <input
                                        type="password"
                                        className="w-full rounded-lg border-gray-200 p-4 pr-12 text-sm shadow-sm"
                                        placeholder="Enter new password"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                    <button
                        className="ml-3 inline-block rounded-lg bg-red-500 px-5 py-3 text-sm font-medium text-white"
                    >  Create an Account
                    </button>


                </div>
            </div>





    );

}
export default Sign_up;