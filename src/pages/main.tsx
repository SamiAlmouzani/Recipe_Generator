import { type NextPage } from "next";
import Link from "next/link";

const RecipeGenerator: NextPage = () => {
    return (
        <section className="bg-gray-50">
      <div
        className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center"
      >
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            <strong className="font-extrabold text-red-700 sm:block">
              Enter Ingredients
            </strong>
          </h1>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="avocado" required></input>
            <Link href="/signin">
              <button
              className="block w-full rounded bg-red-600 px-12 py-3 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
              >
                Enter
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    );
}

export default RecipeGenerator;